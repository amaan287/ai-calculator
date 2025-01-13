import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./component/Home";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import "@/index.css";

export default function App() {
  return (
    <MantineProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Home />} path="/" />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}
