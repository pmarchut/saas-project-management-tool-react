import { useEffect } from "react";
import { useAppDispatch } from "@/stores/store";
import { login } from "@/stores/authUserSlice";

function Login() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(login());
    }, [dispatch]);

    return (
        <div className="absolute top-0 left-0 bottom-0 right-0 bg-white"></div>
    )
}
    
export default Login