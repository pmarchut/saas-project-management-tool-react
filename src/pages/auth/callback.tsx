import { useEffect } from "react";
import { useAppDispatch } from "@/stores/store";
import { handleAuthentication, initUser } from "@/stores/authUserSlice";
import AppLoader from "@/components/AppLoader";
import { useNavigate } from 'react-router-dom'

function Callback() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        async function handleAuthenticationAndRedirect() {
            await dispatch(handleAuthentication())
            await dispatch(initUser())
            navigate("/boards")
        }
        
        handleAuthenticationAndRedirect()
    }, [dispatch, navigate]);

    return (
        <AppLoader overlay={true} />
    )
}
    
export default Callback