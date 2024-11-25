/* eslint-disable react-hooks/exhaustive-deps */
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Header from "./Header";
import Data from "./Data";
import Interactions from "./Interactions";

function App() {

  return (
    <div className="flex flex-col">
      <ToastContainer />
      <Header />
      <Data />
      <Interactions />
    </div>
  );
}

export default App;
