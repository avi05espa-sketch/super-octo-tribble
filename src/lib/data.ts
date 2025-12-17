
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  orderBy,
  addDoc,
  serverTimestamp,
  limit,
  and,
  or,
  updateDoc,
  Timestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
  setDoc,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { Product, Category, User, Chat, Message } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';


// --- Firestore Data Functions ---

export async function getProducts(db: Firestore, {
  categories,
  conditions,
  searchTerm,
  sellerId,
  minPrice,
  maxPrice,
  ids
}: {
  categories?: string[];
  conditions?: string[];
  searchTerm?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  ids?: string[];
} = {}): Promise<Product[]> {
  try {
    const productsRef = collection(db, "products");
    
    let filters = [];

    if (ids) {
        if (ids.length === 0) return []; // No IDs, no products
        filters.push(where('__name__', 'in', ids));
    }
    if (sellerId) {
        filters.push(where("sellerId", "==", sellerId));
    }
    if (categories && categories.length > 0) {
      filters.push(where("category", "in", categories));
    }
    if (conditions && conditions.length > 0) {
        filters.push(where("condition", "in", conditions));
    }
    if (minPrice) {
        filters.push(where("price", ">=", Number(minPrice)));
    }
    if (maxPrice) {
        filters.push(where("price", "<=", Number(maxPrice)));
    }
    
    let q;

    if (searchTerm) {
        // Firestore doesn't support full-text search on multiple fields well.
        // A robust solution uses a search service like Algolia or Elasticsearch.
        // We do a simple "startsWith" on the title.
        // When a search term is present, we ignore other filters for simplicity,
        // unless they are also provided by the AI.
        const searchFilters = [
            ...filters,
            where('title', '>=', searchTerm),
            where('title', '<=', searchTerm + '\uf8ff'),
        ];
        q = query(productsRef, and(...searchFilters), orderBy("title"), orderBy("createdAt", "desc"));
    } else if (filters.length > 0) {
        q = query(productsRef, and(...filters), orderBy("createdAt", "desc"));
    } else {
        q = query(productsRef, orderBy("createdAt", "desc"));
    }
    

    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        condition: data.condition,
        location: data.location,
        sellerId: data.sellerId,
        images: data.images,
        createdAt: data.createdAt?.toDate().toISOString(),
      } as Product;
    });
    return products;
  } catch (error) {
    console.error("Error fetching products from Firestore:", error);
    // If a query fails (e.g. requires an index not yet created), return empty.
    return [];
  }
}

export async function getProduct(db: Firestore, id: string): Promise<Product | undefined> {
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString(),
      } as Product;
    } else {
      console.log("No such product document!");
      return undefined;
    }
  } catch (error) {
    console.error("Error fetching product from Firestore:", error);
    return undefined;
  }
}


export async function getUser(db: Firestore, id: string): Promise<User | undefined> {
   try {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data
      } as User;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error("Error fetching user from Firestore:", error);
    return undefined;
  }
}


// --- Static Data Functions ---

const categories: Category[] = [
  { id: 'autos', name: 'Autos' },
  { id: 'electronica', name: 'Electrónica' },
  { id: 'hogar', name: 'Hogar' },
  { id: 'ropa', name: 'Ropa' },
  { id: 'otros', name: 'Otros' },
];

export function getCategories(): Category[] {
  return categories;
}

export function getCategory(id: string): Category | undefined {
    return categories.find(c => c.id === id);
}

// --- Chat Functions ---

export async function getOrCreateChat(db: Firestore, userId1: string, userId2: string, productId: string): Promise<string> {
    const chatsRef = collection(db, 'chats');

    const q = query(chatsRef, 
        where('participants', 'array-contains', userId1),
        where('productId', '==', productId)
    );

    const querySnapshot = await getDocs(q);
    const existingChats = querySnapshot.docs.map(d => ({...d.data(), id: d.id}) as Chat).filter(c => c.participants.includes(userId2));

    if (existingChats.length > 0) {
        return existingChats[0].id;
    }

    const [user1Data, user2Data, productData] = await Promise.all([
        getUser(db, userId1),
        getUser(db, userId2),
        getProduct(db, productId)
    ]);

    if (!user1Data || !user2Data || !productData) {
        throw new Error("Could not find user or product to create chat.");
    }

    const newChatData: Omit<Chat, 'id'> = {
        participants: [userId1, userId2],
        participantDetails: {
            [userId1]: { name: user1Data.name, avatar: user1Data.profilePicture || '' },
            [userId2]: { name: user2Data.name, avatar: user2Data.profilePicture || '' }
        },
        productId,
        productTitle: productData.title,
        productImage: productData.images[0],
        createdAt: serverTimestamp(),
        lastMessage: {
          text: `Conversación iniciada sobre: ${productData.title}`,
          timestamp: serverTimestamp()
        }
    };
    
    const docRef = await addDoc(chatsRef, newChatData)
        .catch((error) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: chatsRef.path,
                operation: 'create',
                requestResourceData: newChatData,
            }));
            throw error;
        });

    return docRef.id;
}


export async function getChat(db: Firestore, chatId: string): Promise<Chat | undefined> {
    const docRef = doc(db, 'chats', chatId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
            id: docSnap.id, 
            ...data,
            lastMessage: {
                text: data.lastMessage?.text,
                timestamp: data.lastMessage?.timestamp as Timestamp
            },
            createdAt: data.createdAt as Timestamp
        } as Chat;
    }
    return undefined;
}


export async function getChatsForUser(db: Firestore, userId: string): Promise<Chat[]> {
    const chatsRef = collection(db, 'chats');
    const q = query(
        chatsRef, 
        where('participants', 'array-contains', userId),
        orderBy('lastMessage.timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    const chats = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id,
            ...data,
            lastMessage: {
                text: data.lastMessage?.text,
                timestamp: data.lastMessage?.timestamp as Timestamp
            },
            createdAt: data.createdAt as Timestamp
        } as Chat;
    });

    return chats;
}

export function sendMessage(db: Firestore, chatId: string, senderId: string, text: string) {
    if (!text.trim()) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const chatRef = doc(db, 'chats', chatId);

    const newMessage = {
        chatId,
        senderId,
        text: text.trim(),
        timestamp: serverTimestamp(),
    };

    addDoc(messagesRef, newMessage).catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: messagesRef.path,
            operation: 'create',
            requestResourceData: newMessage,
        }));
        // We don't re-throw here so the UI doesn't crash on permission errors
    });

    const chatUpdate = {
        lastMessage: {
            text: text.trim(),
            timestamp: serverTimestamp(),
        }
    };

    updateDoc(chatRef, chatUpdate).catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: chatRef.path,
            operation: 'update',
            requestResourceData: chatUpdate,
        }));
    });
}

// --- Favorites Functions ---

export async function toggleFavorite(db: Firestore, userId: string, productId: string) {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        throw new Error("User not found");
    }

    const favorites = userDoc.data().favorites || [];
    const isFavorited = favorites.includes(productId);

    const updateData = isFavorited 
        ? { favorites: arrayRemove(productId) }
        : { favorites: arrayUnion(productId) };

    updateDoc(userRef, updateData).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: userRef.path,
            operation: 'update',
            requestResourceData: updateData
        }));
        // Re-throw so the UI can know the operation failed
        throw error;
    });

    return !isFavorited;
}

export async function getFavoriteProducts(db: Firestore, userId: string): Promise<Product[]> {
    const user = await getUser(db, userId);
    if (!user || !user.favorites || user.favorites.length === 0) {
        return [];
    }
    
    const favoriteProductIds = user.favorites;
    
    const products: Product[] = [];
    const chunkSize = 30;

    for (let i = 0; i < favoriteProductIds.length; i += chunkSize) {
        const chunk = favoriteProductIds.slice(i, i + chunkSize);
        const chunkProducts = await getProducts(db, { ids: chunk });
        products.push(...chunkProducts);
    }

    return products;
}

// New function to add a product, with error handling
export function addProduct(db: Firestore, productData: Omit<Product, 'id' | 'createdAt'>) {
    const productsRef = collection(db, "products");
    const newProductData = {
        ...productData,
        createdAt: serverTimestamp(),
    };
    
    return addDoc(productsRef, newProductData)
        .catch((error) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: productsRef.path,
                operation: 'create',
                requestResourceData: newProductData,
            }));
            // Re-throw so the UI can handle the submission failure
            throw error;
        });
}

// New function to create a user document, with error handling
export function createUserProfile(db: Firestore, userId: string, userData: Omit<User, 'id' | 'createdAt'>) {
    const userRef = doc(db, 'users', userId);
    const newUserProfile = {
        ...userData,
        createdAt: serverTimestamp(),
    };
    
    // Use setDoc with merge:true to avoid overwriting if it somehow already exists
    return setDoc(userRef, newUserProfile, { merge: true })
        .catch(error => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: userRef.path,
                operation: 'create',
                requestResourceData: newUserProfile,
            }));
            throw error;
        });
}
