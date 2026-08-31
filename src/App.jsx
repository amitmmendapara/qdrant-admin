// App.jsx
import { RouterProvider } from "react-router-dom";
import router from "./routes/routes";
import "./assets/index.css";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      {/* Global Toaster */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
            zIndex: 9999,
          },
        }}
      />

      {/* Router */}
      <RouterProvider router={router} />
    </>
  );
}

export default App;
