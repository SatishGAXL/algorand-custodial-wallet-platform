import Header from "@/components/Header";
import React from "react";

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <main className="max-lg:px-5">
      <Header />
      {children}
    </main>
  );
};

export default RootLayout;
