// import { useCallback, useContext } from "react";
// import Context from "../context/UserContext";

// interface User {
//     isLogged: boolean;
//     login: () => void;
// }

// export default function useUser(): User {
//     const { jwt, setJWT } = useContext(Context);

//     const login = useCallback(() => {
//         setJWT(['test']);  // Ahora se pasa un array
//     }, [setJWT]);

//     console.log("jwt: ",jwt)
//     console.log("wt")

//     return {
//         isLogged: Boolean(jwt),
//         login
//     };
// }