"use client";

import Head from "next/head";
import React from "react";

export default function GlobalHead({ children }) {
  return (
    <Head>
      <title>Buy Me Gala - Support Creators Effortlessly</title>
      <meta
        name="description"
        content="Buy Me Gala is the fastest, simplest platform for fans to support creators, streamers, and developers directly."
      />
      <meta name="keywords" content="Buy Me Gala, creator support, micro-donations, creator platform, Nigerian creators" />
      <meta name="robots" content="index, follow" />
    </Head>
  );
}
