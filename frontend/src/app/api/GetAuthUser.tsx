// import { cookies } from 'next/headers';

// const GetAuthUser = async () => {
//   const cookieStore = await cookies(); // Add await here
//   const token = cookieStore.get('token')?.value;

//   try {
//     const res = await fetch('http://localhost:5000/api/user', {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`, // Attach token to header
//       },
//     });

//     const data = await res.json();
//     return data;
//   } catch (e) {
//     console.error("Error in GetAuthUser:", e);
//     return null;
//   }
// };

// export default GetAuthUser;