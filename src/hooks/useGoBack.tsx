import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const useGoBack = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const goBackButton = () => {
    return (
      <Button
        variant="ghost"
        style={{ padding: "5px", color: "GrayText" }}
        onClick={handleGoBack}
      >
        <ChevronLeft /> Back
      </Button>
    );
  };

  return { goBackButton, handleGoBack };
};

export default useGoBack;
