import axios from "axios";
import { useState,useEffect } from "react";

export async function getRequest(url:any){
    const [data,setData] = useState(null)
    const [loading,setLoading] = useState(true)
    const [error,setError] = useState(false)
    const fetchData = async () => {
        if(!url) return
        try {
            const res = await axios.get(url)
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