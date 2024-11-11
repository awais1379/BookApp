import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import globalStyles from "../styles/globalStyles";

export default function BookDetail({ route }) {
  const { bookId } = route.params;
  const [book, setBook] = useState(null);

  const fetchBook = async () => {
    try {
      const bookRef = doc(db, "books", bookId);
      const bookSnap = await getDoc(bookRef);

      if (bookSnap.exists()) {
        setBook({ id: bookSnap.id, ...bookSnap.data() });
      } else {
        Alert.alert("Error", "Book details not found.");
      }
    } catch (error) {
      console.error("Error fetching book:", error);
    }
  };

  useEffect(
    useCallback(() => {
      fetchBook();
    }, [bookId])
  );

  const handleBorrow = async () => {
    try {
      const borrowedBooksCollection = collection(db, "borrowedBooks");
      const snapshot = await getDocs(borrowedBooksCollection);

      if (snapshot.size >= 3) {
        Alert.alert("Limit Reached", "You can't borrow more than 3 books.");
        return;
      }

      await addDoc(borrowedBooksCollection, {
        id: book.id,
        name: book.name,
        author: book.author,
        coverPage: book.coverPage,
        rating: book.rating,
        summary: book.summary,
        borrowedAt: new Date(),
      });

      const bookRef = doc(db, "books", book.id);
      await updateDoc(bookRef, { isBorrowed: true });

      setBook((prevBook) => ({ ...prevBook, isBorrowed: true }));

      Alert.alert("Success", "Book borrowed successfully!");
    } catch (error) {
      console.error("Error borrowing book:", error);
      Alert.alert("Error", "An error occurred while borrowing the book.");
    }
  };

  if (!book) {
    return (
      <View style={globalStyles.container}>
        <Text>Loading book details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: book.coverPage }} style={styles.coverImage} />

      <View style={styles.infoContainer}>
        <Text style={styles.bookName}>{book.name}</Text>
        <Text style={styles.author}>by {book.author}</Text>
        <Text style={styles.rating}>Rating: {book.rating}</Text>

        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.summary}>{book.summary}</Text>

        <Text
          style={[styles.status, { color: book.isBorrowed ? "red" : "green" }]}
        >
          {book.isBorrowed ? "Currently Borrowed" : "Available"}
        </Text>

        {!book.isBorrowed && (
          <TouchableOpacity style={styles.borrowButton} onPress={handleBorrow}>
            <Text style={styles.borrowButtonText}>Borrow this Book</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  coverImage: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  infoContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  bookName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  author: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  rating: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
  },
  summary: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    textAlign: "justify",
  },
  status: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  borrowButton: {
    marginTop: 10,
    paddingVertical: 15,
    backgroundColor: "#007BFF",
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
  },
  borrowButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
