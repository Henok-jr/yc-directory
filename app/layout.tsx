import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
import { Work_Sans } from "next/font/google";
import 'easymde/dist/easymde.min.css'
import { Toaster } from "@/components/ui/toaster";

// const workSans = localFont({
//   src: [
//     {
//        path: './fonts/workSans-Black.ttf',
//        weight: '900',
//        style: 'normal',    
//       },{
//        path: './fonts/workSans-ExtraBold.ttf',
//        weight: '800',
//        style: 'normal',    
//       },{
//        path: './fonts/workSans-Bold.ttf',
//        weight: '700',
//        style: 'normal',    
//       },{
//        path: './fonts/workSans-SemiBold.ttf',
//        weight: '600',
//        style: 'normal',    
//       },{
//        path: './fonts/workSans-Medium.ttf',
//        weight: '500',
//        style: 'normal',    
//       },{
//        path: './fonts/workSans-Regular.ttf',
//        weight: '400',
//        style: 'normal',    
//       },{
//        path: './fonts/workSans-Light.ttf',
//        weight: '300',
//        style: 'normal',    
//       },{
//        path: './fonts/workSans-Thin.ttf',
//        weight: '200',
//        style: 'normal',    
//       },{
//        path: './fonts/workSans-ExtraLight.ttf',
//        weight: '100',
//        style: 'normal',    
//       },
//   ],
//   variable: '--font-work-sans',
// })

const workSansGoogle = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
})

export const metadata: Metadata = {
  title: "YC Directory",
  description: "Pitch, Vote and Grow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={workSansGoogle.className}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
