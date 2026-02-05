'use client';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebaseConfig';
import { Document } from '@/src/domain/entities';

const COLLECTION_NAME = 'documents';

export class FirebaseDocumentService {
  // Convert Document to Firestore-compatible plain object
  private toFirestoreDoc(document: Document): Record<string, unknown> {
    return {
      id: String(document.id),
      senderName: String(document.senderName),
      department: String(document.department),
      documentType: String(document.documentType),
      weekRange: String(document.weekRange),
      details: String(document.details),
      status: String(document.status),
      submittedDate: String(document.submittedDate),
      receivedDate: document.receivedDate ? String(document.receivedDate) : null,
      completedDate: document.completedDate ? String(document.completedDate) : null,
      cancelledDate: document.cancelledDate ? String(document.cancelledDate) : null,
      cancelReason: document.cancelReason ? String(document.cancelReason) : null,
      staffNote: document.staffNote ? String(document.staffNote) : null,
      history: document.history || [],
    };
  }

  async saveDocument(document: Document): Promise<void> {
    try {
      const db = getFirebaseDb();
      const firestoreDoc = this.toFirestoreDoc(document);
      await setDoc(doc(db, COLLECTION_NAME, String(document.id)), firestoreDoc);
    } catch (error) {
      console.error('Error saving document to Firebase:', error);
      throw error;
    }
  }

  async getDocumentById(id: string): Promise<Document | null> {
    try {
      const db = getFirebaseDb();
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as Document) : null;
    } catch (error) {
      console.error('Error getting document from Firebase:', error);
      throw error;
    }
  }

  async getAllDocuments(): Promise<Document[]> {
    try {
      const db = getFirebaseDb();
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return querySnapshot.docs.map((doc) => doc.data() as Document);
    } catch (error) {
      console.error('Error getting all documents from Firebase:', error);
      throw error;
    }
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<void> {
    try {
      const db = getFirebaseDb();
      // Convert updates to plain object, excluding undefined values
      const firestoreUpdates: Record<string, unknown> = {};
      Object.keys(updates).forEach(key => {
        const value = (updates as Record<string, unknown>)[key];
        if (value !== undefined) {
          firestoreUpdates[key] = value;
        }
      });
      await updateDoc(doc(db, COLLECTION_NAME, String(id)), firestoreUpdates);
    } catch (error) {
      console.error('Error updating document in Firebase:', error);
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      const db = getFirebaseDb();
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting document from Firebase:', error);
      throw error;
    }
  }

  async getDocumentsByDepartment(department: string): Promise<Document[]> {
    try {
      const db = getFirebaseDb();
      const q = query(
        collection(db, COLLECTION_NAME),
        where('department', '==', department)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => doc.data() as Document);
    } catch (error) {
      console.error('Error querying documents by department:', error);
      throw error;
    }
  }

  async getDocumentsByStatus(
    departmentOrStatus: string,
    status?: string
  ): Promise<Document[]> {
    try {
      const db = getFirebaseDb();
      let q;
      if (status) {
        // Query by department and status
        q = query(
          collection(db, COLLECTION_NAME),
          where('department', '==', departmentOrStatus),
          where('status', '==', status)
        );
      } else {
        // Query by status only
        q = query(
          collection(db, COLLECTION_NAME),
          where('status', '==', departmentOrStatus)
        );
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => doc.data() as Document);
    } catch (error) {
      console.error('Error querying documents by status:', error);
      throw error;
    }
  }

  async getDocumentsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<Document[]> {
    try {
      const db = getFirebaseDb();
      const q = query(
        collection(db, COLLECTION_NAME),
        where('submittedDate', '>=', startDate),
        where('submittedDate', '<=', endDate)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => doc.data() as Document);
    } catch (error) {
      console.error('Error querying documents by date range:', error);
      throw error;
    }
  }
}

export const firebaseDocumentService = new FirebaseDocumentService();
