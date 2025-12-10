import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter as Router } from "react-router-dom";
const applyTheme=()=>{
  const theme=localStorage.getItem("theme")||"system";
  const root=document.documentElement;
  if(theme==="dark"){
    root.classList.add("dark");
  }else if(theme==="light"){
    root.classList.remove("dark");
  }else{
    const systemPrefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
    if(systemPrefersDark){
      root.classList.add("dark");
    }else{
      root.classList.remove("dark");
    }
  }
}
applyTheme();

createRoot(document.getElementById("root")).render(
  <Router>
    <App />
  </Router>
);
