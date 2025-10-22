
import axios from "axios";

function useCurrentCurrency() {
//   const [currency, setCurrency] = useState<any>('');
//   const [loading, setLoading] = useState<any>(true);
//   const [error, setError] = useState<any>('');

//   useEffect(() => {
//     async function fetchCurrency() {
//       try {
//         const response = await axios.get("https://ipapi.co/json/");
//         setCurrency(response.data.currency);
//       } catch (err) {
//         setError("Could not fetch currency");
//         console.error("Error fetching location:", err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchCurrency();
//   }, []);

  return "NGN"
}

export default useCurrentCurrency;
