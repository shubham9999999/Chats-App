import "./App.css";
import Homepage from "./pages/HomePage";
import { Route } from "react-router-dom";
import Chatpage from "./pages/ChatPage";

function App() {
  return (
    <div className="App">
      <Route exact path="/" component={Homepage} />
      <Route exact path="/chats" component={Chatpage} />
    </div>
  );
}

export default App;
