import React from "react";
import { Terminal } from "./Terminal";

function App() {
  return <Terminal />;
  // const [details, setDetails] = useState<RepoDetails | null>(null);

  // const fetchUpdates = async () => {
  //   const response = await fetch("http://localhost:8080/api/get-repo-details");
  //   if (response.status !== 200) {
  //     throw new Error(await response.text());
  //   }
  //   const body = await response.json();
  //   setDetails(body);
  // };

  // useEffect(() => {
  //   let interval: number;
  //   interval = window.setInterval(() => {
  //     fetchUpdates().catch((e) => {
  //       console.error(e);
  //       clearInterval(interval);
  //     });
  //   }, 100);
  //   return () => {
  //     clearInterval(interval);
  //   };
  // });
  // return (
  //   <div className="App">
  //     {(details && <Visualizer details={details} />) || (
  //       <p>Details loading...</p>
  //     )}
  //   </div>
  // );
}

export default App;
