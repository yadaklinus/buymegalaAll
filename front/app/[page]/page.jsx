// app/[page]/page.js
import UserProfilePage from "@/components/userProfilePage";
import axios from "axios";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawPage = resolvedParams?.page ? decodeURIComponent(resolvedParams.page) : "";

  if (!rawPage || !rawPage.startsWith("@")) {
    return {
      title: "Buy Me Gala - Support Creators",
      description: "Support your favorite creators on Buy Me Gala!",
    };
  }

  const usernameParam = rawPage.replace("@", "").trim();

  if (!usernameParam || usernameParam === "null" || usernameParam === "undefined") {
    return {
      title: "Buy Me Gala - Support Creators",
      description: "Support your favorite creators on Buy Me Gala!",
    };
  }

  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/user/page`,
      { username: usernameParam }
    );
    const user = res.data;

    if (!user) {
      return {
        title: "Buy Me Gala - Support Creators",
        description: "Support your favorite creators on Buy Me Gala!",
      };
    }

    const bioText = user.bio ? user.bio : `Buy ${name} (@${usernameParam}) a Gala to support their work!`;
    const titleText = `Buy ${name} (@${usernameParam}) a Gala`;
    const avatarUrl = user.profilePicture || user.image || "/gala.png";

    return {
      title: titleText,
      description: bioText,
      openGraph: {
        title: titleText,
        description: bioText,
        siteName: "Buy Me Gala",
        images: [
          {
            url: avatarUrl,
            width: 400,
            height: 400,
            alt: `${name}'s Profile Picture`,
          },
        ],
        type: "profile",
      },
      twitter: {
        card: "summary_large_image",
        title: titleText,
        description: bioText,
        images: [avatarUrl],
      },
    };
  } catch (error) {
    return {
      title: "Creator Profile - Buy Me Gala",
      description: "Support creators on Buy Me Gala!",
    };
  }
}

export default function Page() {
  return <UserProfilePage />;
}
