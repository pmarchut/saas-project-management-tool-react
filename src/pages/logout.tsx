import { useEffect } from "react";
import { useAppDispatch } from "@/stores/store";
import { logout } from "@/stores/authUserSlice";

function Logout() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(logout());
    }, [dispatch]);

    return (
        <div className="absolute top-0 left-0 bottom-0 right-0 bg-white"></div>
    )
}
    
export default Logout