"use client"
import axios from "axios";
import { useEffect, useState } from "react";

const postRequest = (url:any,req:any) => {
    const [data,setData] = useState(null)
    const [loading,setLoading] = useState(true)
    const [error,setError] = useState(false)
    const fetchData = async () => {
        if(!url) return
        try {
            const res = await axios.post(url,req)
            setData(res.data)
        } catch (error) {
            setError(true)
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        fetchData()
    },[url])

    return {data,loading,error}
}
export default postRequest