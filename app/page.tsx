'use client'
import StoreProvider from "./StoreProvider";
import Main from "./components/main/Main";

export default function Home() {

  return (
    <StoreProvider >
      <Main />
    </StoreProvider>
    
  );
}
