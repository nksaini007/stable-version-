// import React, { createContext, useState, useEffect } from "react";

// export const CartContext = createContext();

// export const CartProvider = ({ children }) => {
//   const [cartItems, setCartItems] = useState(() => {
//     // Load cart from localStorage if available
//     const savedCart = localStorage.getItem("cart");
//     return savedCart ? JSON.parse(savedCart) : [];
//   });

//   // Persist cart to localStorage
//   useEffect(() => {
//     localStorage.setItem("cart", JSON.stringify(cartItems));
//   }, [cartItems]);

//   const addToCart = (product) => {
//     // Check if product already exists
//     const exists = cartItems.find((item) => item.id === product.id);
//     if (exists) {
//       setCartItems(
//         cartItems.map((item) =>
//           item.id === product.id
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         )
//       );
//     } else {
//       setCartItems([...cartItems, { ...product, quantity: 1 }]);
//     }
//   };

//   const removeFromCart = (productId) => {
//     setCartItems(cartItems.filter((item) => item.id !== productId));
//   };

//   const clearCart = () => setCartItems([]);

//   // ✅ Increase quantity
//   const increaseQuantity = (productId) => {
//     setCartItems(
//       cartItems.map((item) =>
//         item.id === productId
//           ? { ...item, quantity: item.quantity + 1 }
//           : item
//       )
//     );
//   };

//   // ✅ Decrease quantity
//   const decreaseQuantity = (productId) => {
//     setCartItems(
//       cartItems.map((item) =>
//         item.id === productId
//           ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }
//           : item
//       )
//     );
//   };

//   return (
//     <CartContext.Provider
//       value={{
//         cartItems,
//         addToCart,
//         removeFromCart,
//         clearCart,
//         increaseQuantity,
//         decreaseQuantity,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };
import React, { createContext, useState, useEffect } from "react";
import API from "../api/api";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Load cart from localStorage if available
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add product to cart
  const addToCart = (product) => {
    const exists = cartItems.find((item) => item._id === product._id);
    if (exists) {
      setCartItems(
        cartItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  // Remove product from cart
  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter((item) => item._id !== productId));
  };

  // Clear cart
  const clearCart = () => setCartItems([]);

  // Increase quantity
  const increaseQuantity = (productId) => {
    setCartItems(
      cartItems.map((item) =>
        item._id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Decrease quantity
  const decreaseQuantity = (productId) => {
    setCartItems(
      cartItems.map((item) =>
        item._id === productId
          ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }
          : item
      )
    );
  };

  // ✅ Create order
  const createOrder = async (token) => {
    if (cartItems.length === 0) {
      return { success: false, message: "Cart is empty" };
    }

    try {
      const orderItems = cartItems.map((item) => ({
        product: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        seller: item.seller, // Make sure seller ID exists
      }));

      const orderData = {
        orderItems,
        totalPrice: cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      };

      const response = await API.post(
        `/orders`,
        orderData
      );

      clearCart(); // Clear cart after successful order

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Order creation error:", error.response || error);
      return {
        success: false,
        message: error.response?.data?.message || "Order creation failed",
      };
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        increaseQuantity,
        decreaseQuantity,
        createOrder, // ✅ Expose order creation
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
