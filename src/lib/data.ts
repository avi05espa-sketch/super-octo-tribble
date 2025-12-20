
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
  increment,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { Product, Category, User, Chat, Message } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

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

    if (ids && ids.length > 0) {
        // Firestore 'in' queries are limited to 30 items.
        // If we have more, we need to do multiple queries.
        // For this app, we'll assume we won't hit that limit in most cases.
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
    if (minPrice !== undefined && minPrice > 0) {
        filters.push(where("price", ">=", Number(minPrice)));
    }
    if (maxPrice !== undefined) {
        filters.push(where("price", "<=", Number(maxPrice)));
    }
    
    let q;

    if (searchTerm) {
        // Firestore doesn't support full-text search on multiple fields well.
        // A robust solution uses a search service like Algolia or Elasticsearch.
        // We do a simple "startsWith" on the title.
        const searchFilters = [
            ...filters,
            where('title', '>=', searchTerm),
            where('title', '<=', searchTerm + '\uf8ff'),
        ];
        q = query(productsRef, and(...searchFilters), orderBy("title"), orderBy("createdAt", "desc"));
    } else if (filters.length > 0) {
        q = query(productsRef, and(...filters), orderBy("createdAt", "desc"));
    } else {
        q = query(productsRef, orderBy("createdAt", "desc"), limit(20));
    }
    
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
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

    const newChatData = {
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
            } satisfies SecurityRuleContext));
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
        } satisfies SecurityRuleContext));
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
        } satisfies SecurityRuleContext));
    });
}

// --- Favorites Functions ---

export async function toggleFavorite(db: Firestore, userId: string, productId: string) {
    const userRef = doc(db, "users", userId);
    const productRef = doc(db, "products", productId);

    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        throw new Error("User not found");
    }
    const isFavorited = userDoc.data().favorites?.includes(productId);

    const batch = writeBatch(db);

    const userUpdate = isFavorited 
        ? { favorites: arrayRemove(productId) }
        : { favorites: arrayUnion(productId) };
    
    const productUpdate = isFavorited
        ? { favoritedBy: arrayRemove(userId), }
        : { favoritedBy: arrayUnion(userId), };

    batch.update(userRef, userUpdate);
    batch.update(productRef, productUpdate);

    await batch.commit().catch(error => {
         errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: userRef.path,
            operation: 'update',
            requestResourceData: { userUpdate, productUpdate }
        } satisfies SecurityRuleContext));
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
    const chunkSize = 30; // Firestore 'in' query limit

    for (let i = 0; i < favoriteProductIds.length; i += chunkSize) {
        const chunk = favoriteProductIds.slice(i, i + chunkSize);
        if (chunk.length > 0) {
            const chunkProducts = await getProducts(db, { ids: chunk });
            products.push(...chunkProducts);
        }
    }

    return products;
}

// --- Product Functions ---

export function addProduct(db: Firestore, productData: Omit<Product, 'id' | 'createdAt'>) {
    const productsRef = collection(db, "products");
    const newProductData = {
        ...productData,
        viewCount: 0,
        favoritedBy: [],
        createdAt: serverTimestamp(),
    };
    
    return addDoc(productsRef, newProductData)
        .catch((error) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: productsRef.path,
                operation: 'create',
                requestResourceData: newProductData,
            } satisfies SecurityRuleContext));
            throw error;
        });
}

export function incrementProductViewCount(db: Firestore, productId: string) {
    const productRef = doc(db, 'products', productId);
    updateDoc(productRef, {
        viewCount: increment(1)
    }).catch(error => {
        // This can fail if rules are restrictive, but we don't want to bother the user
        // with an error toast for a simple view count increment.
        console.warn(`Could not increment view count for product ${productId}:`, error.message);
    });
}


// --- User Functions ---

export async function getAllUsers(db: Firestore): Promise<User[]> {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as User));
}

export async function updateUserRole(db: Firestore, userId: string, role: 'user' | 'admin'): Promise<void> {
    const userRef = doc(db, 'users', userId);
    
    const roleUpdate = { role };

    return updateDoc(userRef, roleUpdate).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: userRef.path,
            operation: 'update',
            requestResourceData: roleUpdate,
        } satisfies SecurityRuleContext));
        throw error;
    });
}


export function createUserProfile(db: Firestore, userId: string, userData: Omit<User, 'id' | 'createdAt' | 'uid'>) {
    const userRef = doc(db, 'users', userId);
    const newUserProfile = {
        uid: userId,
        ...userData,
        role: 'user', // Default role for new users
        createdAt: serverTimestamp(),
    };
    
    return setDoc(userRef, newUserProfile, { merge: true })
        .catch(error => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: userRef.path,
                operation: 'create',
                requestResourceData: newUserProfile,
            } satisfies SecurityRuleContext));
            throw error;
        });
}
