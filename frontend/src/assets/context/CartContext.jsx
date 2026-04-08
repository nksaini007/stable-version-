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
    const checksum = localStorage.getItem("cart_integrity");
    
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      // Basic Zero-Trust Checksum Verification
      const calculatedHash = btoa(JSON.stringify(parsed)).slice(0, 16);
      if (checksum && checksum !== calculatedHash) {
        console.warn("SECURITY_SIGNAL: Cart integrity mismatch detected. Sanitizing...");
        localStorage.removeItem("cart");
        localStorage.removeItem("cart_integrity");
        return [];
      }
      return parsed;
    }
    return [];
  });

  const [isVerifying, setIsVerifying] = useState(false);

  // Persist cart to localStorage with Integrity Hash
  useEffect(() => {
    const cartData = JSON.stringify(cartItems);
    localStorage.setItem("cart", cartData);
    const calculatedHash = btoa(cartData).slice(0, 16);
    localStorage.setItem("cart_integrity", calculatedHash);
  }, [cartItems]);

  // Zero-Trust Verification Loop
  const verifyCart = async () => {
    if (cartItems.length === 0) return;
    try {
      setIsVerifying(true);
      const verifiedItems = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const { data } = await API.get(`/products/${item._id}`);
            let currentPrice = data.price;
            let inStock = data.stock > 0;

            if (item.variantId) {
              const variant = data.variants?.find(v => v._id === item.variantId);
              if (variant) {
                currentPrice = variant.price;
                inStock = variant.stock > 0;
              }
            }

            return {
              ...item,
              price: currentPrice,
              inStock,
              lastVerified: new Date().toISOString()
            };
          } catch (err) {
            return { ...item, inStock: false }; // Defensive fallback
          }
        })
      );
      setCartItems(verifiedItems);
    } catch (error) {
      console.error("Cart Verification Failure:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  // Add product to cart
  const addToCart = (product) => {
    // Treat as same item only if BOTH product ID and variant ID match
    const exists = cartItems.find((item) => 
      item._id === product._id && item.variantId === product.variantId
    );
    
    if (exists) {
      setCartItems(
        cartItems.map((item) =>
          (item._id === product._id && item.variantId === product.variantId)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  // Remove product from cart
  const removeFromCart = (productId, variantId = null) => {
    setCartItems(cartItems.filter((item) => {
      const isSameProduct = item._id === productId;
      const isSameVariant = item.variantId === variantId || (!item.variantId && !variantId);
      return !(isSameProduct && isSameVariant);
    }));
  };

  // Clear cart
  const clearCart = () => setCartItems([]);

  // Increase quantity
  const increaseQuantity = (productId, variantId = null) => {
    setCartItems(
      cartItems.map((item) => {
        const isSameProduct = item._id === productId;
        const isSameVariant = item.variantId === variantId || (!item.variantId && !variantId);
        return (isSameProduct && isSameVariant)
          ? { ...item, quantity: item.quantity + 1 }
          : item;
      })
    );
  };

  // Decrease quantity
  const decreaseQuantity = (productId, variantId = null) => {
    setCartItems(
      cartItems.map((item) => {
        const isSameProduct = item._id === productId;
        const isSameVariant = item.variantId === variantId || (!item.variantId && !variantId);
        return (isSameProduct && isSameVariant)
          ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }
          : item;
      })
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
        createOrder, 
        verifyCart,
        isVerifying,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
