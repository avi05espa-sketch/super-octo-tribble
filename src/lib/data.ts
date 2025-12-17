
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
  updateDoc
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { Product, Category, User, Chat, Message } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';


// --- Firestore Data Functions ---

export async function getProducts(db: Firestore, {
  categories,
  conditions,
  searchTerm,
}: {
  categories?: string[];
  conditions?: string[];
  searchTerm?: string;
} = {}): Promise<Product[]> {
  try {
    const productsRef = collection(db, "products");
    
    let q = query(productsRef, orderBy("createdAt", "desc"));

    const filters = [];
    if (categories && categories.length > 0) {
      filters.push(where("category", "in", categories));
    }
    if (conditions && conditions.length > 0) {
        filters.push(where("condition", "in", conditions));
    }
     if (searchTerm) {
      // Firestore doesn't support full-text search natively on multiple fields.
      // A more robust solution would use a dedicated search service like Algolia or Elasticsearch.
      // For this app, we will do a simple "startsWith" on the title.
      q = query(productsRef, 
        where('title', '>=', searchTerm),
        where('title', '<=', searchTerm + '\uf8ff'),
        orderBy("title"), 
        orderBy("createdAt", "desc")
      );
    }

    if (filters.length > 0 && !searchTerm) {
      q = query(productsRef, orderBy("createdAt", "desc"), and(...filters));
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
        createdAt: data.createdAt.toDate().toISOString(),
      } as Product;
    });
    return products;
  } catch (error) {
    console.error("Error fetching products from Firestore:", error);
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
        createdAt: data.createdAt.toDate().toISOString(),
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

    // Check if a chat already exists between these two users for this product
    const q = query(chatsRef, 
        where('participants', 'array-contains', userId1),
        where('productId', '==', productId)
    );

    const querySnapshot = await getDocs(q);
    const existingChats = querySnapshot.docs.map(d => ({...d.data(), id: d.id}) as Chat).filter(c => c.participants.includes(userId2));

    if (existingChats.length > 0) {
        return existingChats[0].id;
    }

    // If not, create a new chat
    const [user1Data, user2Data, productData] = await Promise.all([
        getUser(db, userId1),
        getUser(db, userId2),
        getProduct(db, productId)
    ]);

    if (!user1Data || !user2Data || !productData) {
        throw new Error("Could not find user or product to create chat.");
    }

    const newChat: Omit<Chat, 'id'> = {
        participants: [userId1, userId2],
        participantDetails: {
            [userId1]: { name: user1Data.name, avatar: user1Data.profilePicture || '' },
            [userId2]: { name: user2Data.name, avatar: user2Data.profilePicture || '' }
        },
        productId,
        productTitle: productData.title,
        productImage: productData.images[0],
        createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(chatsRef, newChat);
    return docRef.id;
}


export async function getChat(db: Firestore, chatId: string): Promise<Chat | undefined> {
    const docRef = doc(db, 'chats', chatId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Chat;
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
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Chat);
}

export async function sendMessage(db: Firestore, chatId: string, senderId: string, text: string) {
    if (!text.trim()) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const chatRef = doc(db, 'chats', chatId);

    const newMessage = {
        chatId,
        senderId,
        text: text.trim(),
        timestamp: serverTimestamp(),
    };

    await addDoc(messagesRef, newMessage);

    // Update last message on the chat document
    await updateDoc(chatRef, {
        lastMessage: {
            text: text.trim(),
            timestamp: serverTimestamp(),
        }
    });
}
