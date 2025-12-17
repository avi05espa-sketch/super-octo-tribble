
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: "Nuevo" | "Usado";
  location: string;
  sellerId: string;
  images: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface User {
  id: string;
  uid: string;
  name: string;
  email: string;
  profilePicture?: string;
  location?: string;
  createdAt: any; // Can be a server timestamp
  favorites?: string[];
  rating?: number;
  ratingCount?: number;
}


export interface Chat {
    id: string;
    participants: string[];
    participantDetails: {
        [uid: string]: {
            name: string;
            avatar: string;
        }
    };
    productId: string;
    productTitle: string;
    productImage: string;
    lastMessage?: {
        text: string;
        timestamp: any;
    };
    createdAt: any;
}


export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    text: string;
    timestamp: any;
}
