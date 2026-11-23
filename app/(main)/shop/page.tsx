import { redirect } from "next/navigation";

// A loja (vidas e Pro) saiu da área da criança. Futuramente: área protegida para responsáveis.
const ShopPage = () => {
  redirect("/learn");
};

export default ShopPage;
