"use client";

import Head from "next/head";
import React from "react";

export default function GlobalHead({children}:{children:React.ReactNode}) {
  return (
    <Head>
      <title>Buy Me Gala</title>
      <meta
        name="description"
        content="A friendly, fast way for fans to support your work. Set your Gala price and share your page."
      />
      <meta name="keywords" content="codegit, code git, coding, teaching" />

      <meta name="robots" content="index, follow" />

      {/* Favicon / icon */}
      <link rel="icon" href="/gala.png" />

      
      {/* <meta property="og:title" content="Yadak Linus" />
      <meta
        property="og:description"
        content="A Creative Developer who builds beautiful, responsive, and unique web experiences. I'm also passionate about teaching the next generation of developers."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://yadak.com.ng" />
      <meta
        property="og:image"
        content="https://placehold.co/1200x630/0a101e/ffffff?text=Yadak-Linus"
      /> */}

      {/* Optional twitter card */}
       {/* <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Yadak Linus" />
      <meta
        name="twitter:description"
        content="A Creative Developer who builds beautiful, responsive, and unique web experiences. I'm also passionate about teaching the next generation of developers."
      />
      <meta
        name="twitter:image"
        content="https://placehold.co/1200x630/0a101e/ffffff?text=Yadak-Linus"
      /> */}
    </Head>
    
  );
}
