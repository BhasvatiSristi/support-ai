"use client"
import React, { useEffect, useRef, useState } from 'react'
import { motion } from "motion/react"
import { useRouter } from 'next/navigation'
import axios from 'axios'


function DashboardClient({ownerId}:{ownerId:string}) {
    const navigate = useRouter()
    const [businessName,setBusinessName] = useState("")
    const [supportEmail,setSupportEmail] = useState("")
    const [knowledge,setKnowledge] = useState("")
    const [websiteUrl,setWebsiteUrl] = useState("")
    const [loadingWebsite,setLoadingWebsite] = useState(false)
    const [loading,setLoading] = useState(false)
    const [saved,setSaved] = useState(false)
    const [toast,setToast] = useState<{message:string,type:'success'|'error'} | null>(null)
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const showToast = (message:string, type:'success'|'error') => {
        if(toastTimerRef.current){
            clearTimeout(toastTimerRef.current)
        }

        setToast({message,type})
        toastTimerRef.current = setTimeout(()=>{
            setToast(null)
        },3000)
    }

    useEffect(()=>{
        return ()=>{
            if(toastTimerRef.current){
                clearTimeout(toastTimerRef.current)
            }
        }
    },[])

    const isValidWebsiteUrl = (value:string) => {
        try {
            const parsedUrl = new URL(value)
            return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
        } catch {
            return false
        }
    }

    const handleAutoLearn = async () => {
        const trimmedUrl = websiteUrl.trim()

        if(!isValidWebsiteUrl(trimmedUrl)){
            showToast("Unable to learn website.", "error")
            return
        }

        setLoadingWebsite(true)

        try {
            const result = await axios.post("/api/autolearn", {
                websiteUrl: trimmedUrl,
            })

            if(result.data?.success && typeof result.data?.knowledge === 'string'){
                setKnowledge(result.data.knowledge)
                showToast("Website learned successfully.", "success")
                return
            }

            showToast("Unable to learn website.", "error")
        } catch(err) {
            console.log(err)
            showToast("Unable to learn website.", "error")
        } finally {
            setLoadingWebsite(false)
        }
    }

    const handleSettings = async () => {
        setLoading(true)
        try {
            const result = await axios.post("/api/settings",
                {ownerId,businessName,supportEmail,knowledge})
            console.log(result.data)
            setSaved(true)
            setTimeout(()=>{setSaved(false)},3000)
        } catch(err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(()=>{
        if(ownerId){
            const handleGetDetails = async () => {
                try {
                    const result = await axios.post("/api/settings/get",{ownerId})
                    setBusinessName(result.data.businessName)
                    setSupportEmail(result.data.supportEmail)
                    setKnowledge(result.data.knowledge)
                    
                } catch(err) {
                    console.log(err)
                }
            }
            handleGetDetails()
        }

    },[ownerId]) 

  return (
    <div className='min-h-screen bg-zinc-50 text-zinc-900'>
      <motion.div
                initial={{ y: -40 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.4 }}
                className='fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-200'
            >
                <div className='max-x-7xl mx-auto px-6 h-16 flex items-center justify-between'>
                    <div className='text-lg font-semibold tracking-tight' onClick={()=>navigate.push('/')}>Support
                        <span className='text-zinc-500'>AI</span></div>
                        <div className='flex items-center gap-3'>
                            <button className='px-4 py-2 rounded-lg border
                                                border-zinc-300 text-sm 
                                                hover:bg-zinc-100 transition'
                                                onClick={()=>navigate.push("/dashboard/insights")}>
                                AI Insights
                            </button>
                            <button className='px-4 py-2 rounded-lg border
                                                border-zinc-300 text-sm 
                                                hover:bg-zinc-100 transition'
                                                onClick={()=>navigate.push("/embed")}>
                                Embed Chatbot
                            </button>
                        </div>
                </div>
            </motion.div>
        
        <div className='flex justify-center px-4 py-14 mt-20'>
            <motion.div
            className='w-full max-w-3xl bg-white rounded-2xl shadow-xl p-10'>
                <div className='mb-10'>
                    <h1 className='text-2xl font-semibold'>Chatbot Settings</h1>
                    <p className='text-zinc-500 mt-1'>Manage your AI chatbot knowledge and business details</p>
                </div>
                <div className='mb-10'>
                    <h1 className='text-lg font-medium mb-4'>Business Details</h1>
                    <div className='space-y-4'>
                        <input type="text" 
                            className='w-full rounded-xl border
                                        border-zinc-300 px-4 py-3
                                        text-sm focus:outline-none focus:ring-2
                                        focus:ring-black/80' placeholder='Business Name'
                                        value={businessName} onChange={(e)=>{setBusinessName(e.target.value)}}/>
                        <input type="text" 
                            className='w-full rounded-xl border
                                        border-zinc-300 px-4 py-3
                                        text-sm focus:outline-none focus:ring-2
                                        focus:ring-black/80' placeholder='Support Email'
                                        value={supportEmail} onChange={(e)=>{setSupportEmail(e.target.value)}}/>
                    </div>
                </div>
                <div className='mb-10'>
                    <h1 className='text-lg font-medium mb-2'>Website URL</h1>
                    <p className='text-sm text-zinc-500 mb-4'>Enter your business website. SupportAI will automatically learn your website content and build the chatbot knowledge base.</p>
                    <div className='flex flex-col gap-3 md:flex-row md:items-stretch'>
                        <input
                            type='url'
                            className='min-w-0 flex-1 rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/80'
                            placeholder='https://yourbusiness.com'
                            value={websiteUrl}
                            onChange={(e)=>{setWebsiteUrl(e.target.value)}}
                        />
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            type='button'
                            disabled={loadingWebsite}
                            onClick={handleAutoLearn}
                            className='inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 md:min-w-40'
                        >
                            {loadingWebsite && (
                                <span className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                            )}
                            {loadingWebsite ? 'Learning...' : 'Auto Learn'}
                        </motion.button>
                    </div>
                </div>
                <div className='mb-10'>
                    <h1 className='text-lg font-medium mb-4'>Knowledge Base</h1>
                    <p className='text-sm text-zinc-500 mb-4'>Add FAQs, policies, delivery information, refunds, etc.</p>
                    <div className='space-y-4'>
                        <textarea 
                            className='w-full h-54 rounded-xl border
                                        border-zinc-300 px-4 py-3
                                        text-sm focus:outline-none focus:ring-2
                                        focus:ring-black/80' placeholder={`Example:
• Refund policy : 7 days return available
• Delivery time : 3-5 days
• Cash on delivery(COD) available
• Support hours`} value={knowledge} onChange={(e)=>{setKnowledge(e.target.value)}}/>
                    </div>
                    
                </div>
            <div className='flex items-center gap-5'>
                <motion.button
                whileHover={{ scale: 1.03}}
                whileTap={{ scale:0.97 }}
                disabled={loading}
                onClick={handleSettings}
                className='px-7 py-3 rounded-xl bg-black text-white
                            text-sm font-medium hover:bg-zinc-800 
                            transition disabled:opacity-60'>
                {loading?"Saving...": "Save"}
                </motion.button>

                {saved && <motion.span
                initial={{ opacity:0, y:6}}
                animate={{ opacity:1,y:0}}
                className='text-sm font-medium text-emerald-600'>
                        ✓ Settings Saved
                </motion.span>}
            </div>
            </motion.div>
        </div>
        {toast && (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`fixed right-4 top-20 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${toast.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}
            >
                {toast.message}
            </motion.div>
        )}
    </div>
  )
}

export default DashboardClient
