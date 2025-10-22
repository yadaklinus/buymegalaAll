// import axios from "axios";
import currentCurrency from "./currentCurrency";

function exchangeRate(){
    const currency = currentCurrency()
    
    // const url = 'https://api.flutterwave.com/v3/transfers/rates';
    // const params = {
    // amount: 1000,
    // destination_currency: 'USD',
    // source_currency: 'KES'
    // };

    // const headers = {
    // Authorization: 'Bearer FLWSECK_TEST-def07d111f4cccc1c533047ea244e16a-X'
    // };

    // axios.get(url, { params, headers })
    // .then(response => {
    //     console.log(response.data);
    // })
    // .catch(error => {
    //     console.error('Error fetching rates:', error.response?.data || error.message);
    // });

    return 0.034
}

export default exchangeRate