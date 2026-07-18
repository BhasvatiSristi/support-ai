"use client"
import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const HomeClient = ({ email }: { email: string }) => {
    const [loading,setLoading] = useState(false)

    const handleLogin = () => {
        setLoading(true)
        window.location.href = "/api/auth/login"
    }

    const firstLetter = email ? email[0].toUpperCase() : "*";

    const [open, setOpen] = useState(false)
    const popupRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                popupRef.current &&
                !popupRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handler);

        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleLogout = async () => {
        try {
            const result = await axios.get('/api/auth/logout')
            window.location.href='/'
        }catch(error){
            console.log(error)
        }
    }

    const navigate = useRouter()

    const features=[
        {
            title:"Plug & Play",
            desc:"Add the chatbot to your website with a single script tag."
        },
        {
            title:"Admin Controlled",
            desc:"You control what the AI knows, how it responds and the insights."
        },
        {
            title:"Always Online",
            desc:"Your customers can reach you 24/7."
        }
    ]

    return (
        <div className='min-h-screen bg-linear-to-br from-white via-blue-50 to-blue-100 text-slate-900 overflow-x-hidden'>
            <motion.div
                initial={{ y: -40 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.4 }}
                className='fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-blue-100'
            >
                <div className='max-x-7xl mx-auto px-6 h-16 flex items-center justify-between'>
                    <div className='text-lg font-semibold tracking-tight'>IntelliSupport</div>
                    {email ? <div className='relative' ref={popupRef}>
                        <button
                            className='w-10 h-10 rounded-full 
                        bg-blue-600 text-white
                        flex items-center justify-center
                        font-semibold hover:scale-105 transition'
                            onClick={() => setOpen(!open)}>
                            {firstLetter}
                        </button>
                        <AnimatePresence>
                            {open && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}

                                    className='absolute right-0 mt-3 w-44
                                                    bg-white rounded-xl shadow-xl
                                                    border border-blue-100 overflow-hidden'>
                                    <button className='w-full text-left px-4 py-3 text-sm
                                                        hover:bg-blue-50' onClick={()=>navigate.push('/dashboard')}>
                                        Dashboard
                                    </button>
                                    <button className='w-full text-left block px-4 py-3 text-sm text-red-600
                                                        hover:bg-blue-50' onClick={handleLogout}>
                                        Logout
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>


                    </div> : <button
                        className='px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-medium
                        hover:bg-blue-700 transition disabled:opacity-60 flex items-center gap-2
                        cursor-pointer' onClick={handleLogin} disabled={loading}>
                        {loading?"Loading..":"Login"}
                    </button>}
                </div>
            </motion.div>
            <section className='pt-36 pb-28 px-6'>
                <div className='max-w-6xl mx-auto grid grid-cols-1
                                md:grid-cols-2 gap-20 items-center'>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className='text-4xl md:text-5xl font-semibold leading-tight'>
                        <h1>The<span className='text-blue-600'> Customer Support</span><br/>
                            Build for Modern Websites</h1>
                        <p className='mt-6 text-lg text-slate-600 max-w-xl'>Add a powerful AI Chatbot to your website in minutes.<br/>
                            Let your customers get instant answers using your own business knowledge.
                        </p>
                        <div className='mt-10 flex gap-4 text-xl'>
                            {email ? <button
                                className='px-7 py-3 rounded-xl bg-blue-600
                                    text-white font-medium hover:bg-blue-700 
                                        transition disabled:opacity-60' onClick={()=>navigate.push('/dashboard')}>
                                Go to Dashboard
                            </button> : <button
                                className='px-7 py-3 rounded-xl bg-blue-600
                                    text-white font-medium hover:bg-blue-700 
                                        transition disabled:opacity-60'
                                onClick={handleLogin}>
                                Get Started
                            </button>}

                            <a href='#features'
                                className='px-7 py-3 rounded-xl
                                        border border-blue-200 text-blue-700
                                        hover:bg-blue-50 transition'>
                                Learn more
                            </a>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className='relative'>
                        <div className='rounded-2xl bg-white shadow-2xl
                                        border border-blue-100 p-6'>
                            <div className='text-sm text-blue-500 mb-3'>
                                Live Chat Preview
                            </div>
                            <div className='space-y-2'>
                                <div className='bg-blue-50 rounded-lg px-4 py-2 text-sm w-fit text-slate-700'>Do you offer COD?</div>
                                <div className='bg-blue-600 text-white rounded-lg px-4 py-2 text-sm ml-auto w-fit'>Yes, We do!</div>
                                
                            </div>
                            <motion.div
                            animate={{y:[0,12,0]}}
                            transition={{ repeat : Infinity, duration:3 }}
                            className='absolute -bottom-6 -right-6
                                        w-14 h-14 rounded-full
                                        bg-blue-600 text-white
                                        flex items-center
                                        justify-center shadow-xl'
                            >
                                🗨️
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>
            <section id='features'
            className='bg-blue-50 py-28 px-6 border-t border-blue-100'>
                <div className='max-w-6xl mx-auto'>
                    <motion.h2
                    initial={{opacity:0, y:20}}
                    whileInView={{opacity:1, y:0}}
                    viewport={{once:false}}
                    transition={{duration:0.5}}
                    className='text-3xl font-semibold text-center'>
                        Why <span className='text-blue-600'>Businesses</span> choose IntelliSupport
                    </motion.h2>
                    <div className='mt-16 grid grid-cols-1 md:grid-cols-3 gap-10'>
                        {features.map((feature,index)=>(
                            <motion.div
                            key={index}
                            initial={{opacity:0, y:20}}
                            whileInView={{opacity:1, y:0}}
                            transition={{delay:index*0.1}}
                            viewport={{once:false}}
                            className='bg-white rounded-2xl shadow-lg border border-blue-100 p-8'>
                                <h1 className='text-lg font-medium'>{feature.title}</h1>
                                <p className='mt-3 text-slate-600 text-sm'>{feature.desc}</p>
                            </motion.div>))}
                    </div>
                </div>
            </section>
            <footer className='py-10 text-center text-sm text-blue-500'>
                &copy;{new Date().getFullYear()} IntelliSupport. All rights reserved.
            </footer>
        </div>
    )
}

export default HomeClient
