// app/[page]/page.js
import UserProfilePage from "@/components/userProfilePage";
import axios from "axios";
import { notFound } from "next/navigation";


// Next.js will pass { params } automatically
export async function generateMetadata({ params }) {
  const usernameParam = decodeURIComponent(params.page).replace("@", "");

  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/page`,
      { username: usernameParam }
    );
    const user = res.data;

    return {
      title: `${user?.displayName || usernameParam} - Buy Me Gala`,
      description:
        user.bio ||
        `Support ${user.displayName || usernameParam} on Buy Me Gala!`,
      openGraph: {
        title: `${user.displayName || usernameParam} - Buy Me Gala`,
        description:
          user.bio ||
          `Support ${user.displayName || usernameParam} on Buy Me Gala!`,
        images: [
          {
            url: user.profilePicture,
            width: 256,
            height: 256,
            alt: `${user.displayName}'s Profile Picture`,
          },
        ],
      },
    };
  } catch (error) {
    console.error("Failed to fetch metadata:", error);
    return notFound()
  }
}

export default function Page() {
  return <UserProfilePage/>;
}
