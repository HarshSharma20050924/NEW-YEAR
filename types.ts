import React from 'react';

export interface WishData {
  recipient: string;
  message: string;
  
  // Changed from single photo to array for Gallery
  galleryImages: string[]; 
  
  // Custom Assets
  globalBackgroundUrl?: string; // New: Covers the whole website
  textSectionBgUrl?: string; 
  photoSectionBgUrl?: string; 
  decorationUrl?: string; 
  
  // Audio
  musicUrl?: string;
  musicStartTime?: number; 
}

export interface ScrapbookElementProps {
  rotation?: number;
  zIndex?: number;
  className?: string;
  children: React.ReactNode;
}
