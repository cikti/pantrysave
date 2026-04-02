import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAvatar } from "@/hooks/useAvatar";
import { useAuth } from "@/contexts/AuthContext";

interface UserAvatarProps {
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-20 h-20",
};

const iconSizeMap = {
  sm: 14,
  md: 18,
  lg: 32,
};

const UserAvatar = ({ size = "sm", onClick }: UserAvatarProps) => {
  const { avatarUrl } = useAvatar();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = onClick ?? (() => navigate("/profile"));

  return (
    <button
      onClick={handleClick}
      className={`${sizeMap[size]} rounded-full overflow-hidden border-2 border-border shadow-sm flex items-center justify-center bg-muted active:scale-90 transition-transform shrink-0`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        <User size={iconSizeMap[size]} className="text-muted-foreground" />
      )}
    </button>
  );
};

export default UserAvatar;
