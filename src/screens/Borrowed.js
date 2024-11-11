import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  getDocs,
} from "firebase/firestore";

export default function Borrowed() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  useEffect(() => {
    const borrowedBooksCollection = collection(db, "borrowedBooks");
    const unsubscribe = onSnapshot(borrowedBooksCollection, (snapshot) => {
      const booksList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBorrowedBooks(booksList);
    });

    return () => unsubscribe();
  }, []);

  const handleReturnBook = async (originalBookId) => {
    try {
      const borrowedBooksCollection = collection(db, "borrowedBooks");
      const q = query(
        borrowedBooksCollection,
        where("id", "==", originalBookId)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log("No matching document found in borrowedBooks!");
        Alert.alert("Error", "The borrowed book record does not exist.");
        return;
      }

      const borrowedBookDocId = snapshot.docs[0].id;
      await deleteDoc(doc(db, "borrowedBooks", borrowedBookDocId));
      console.log("Deleted from borrowedBooks collection");

      const bookRef = doc(db, "books", originalBookId);
      await updateDoc(bookRef, { isBorrowed: false });
      console.log("Updated isBorrowed flag in books collection");

      Alert.alert("Success", "Book returned successfully!");
    } catch (error) {
      console.error("Error returning book:", error);
      Alert.alert("Error", "An error occurred while returning the book.");
    }
  };

  return (
    <View style={styles.container}>
      {borrowedBooks.length === 0 ? (
        <Text style={styles.emptyText}>
          You haven't borrowed any books yet.
        </Text>
      ) : (
        <FlatList
          data={borrowedBooks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.bookCard}>
              <View style={styles.bookInfo}>
                <Text style={styles.bookName}>{item.name}</Text>
                <Text style={styles.author}>by {item.author}</Text>
              </View>
              <TouchableOpacity
                style={styles.returnButton}
                onPress={() => handleReturnBook(item.id)}
              >
                <Text style={styles.returnButtonText}>Return</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
    marginTop: 50,
  },
  listContent: {
    paddingBottom: 20,
  },
  bookCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookInfo: {
    flex: 1,
  },
  bookName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: "#666",
  },
  returnButton: {
    backgroundColor: "#FF6347",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  returnButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
