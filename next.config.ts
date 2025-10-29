import type { NextConfig } from "next";
import { createVanillaExtractPlugin } from "@vanilla-extract/next-plugin";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // You can keep other options here (images, headers, etc.)
};

export default createVanillaExtractPlugin()(nextConfig);