const imageRoot = "/Food_Image(NangNyamai)";

const imagePaths: Record<string, string> = {
  "sarawak-ethnic-kitchen-a-la-carte|manok pansoh": `${imageRoot}/SARAWAK_ETHNIC KITCHEN ALA CARTE/AYAM_PANSOH.avif`,
  "sarawak-ethnic-kitchen-a-la-carte|ikan asam pedas": `${imageRoot}/SARAWAK_ETHNIC KITCHEN ALA CARTE/IKAN_ASAM_PEDAS.avif`,
  "sarawak-ethnic-kitchen-a-la-carte|daging tepus": `${imageRoot}/SARAWAK_ETHNIC KITCHEN ALA CARTE/DAGING_TEPUS.avif`,
  "sarawak-ethnic-kitchen-a-la-carte|sayur paku masak belacan": `${imageRoot}/SARAWAK_ETHNIC KITCHEN ALA CARTE/SAYUR_PAKU_BELACAN.avif`,
  "sarawak-ethnic-kitchen-a-la-carte|labu masak lemak": `${imageRoot}/SARAWAK_ETHNIC KITCHEN ALA CARTE/SAYUR_LABU_KUNING_MASAK_LEMAK.avif`,
  "sarawak-ethnic-kitchen-a-la-carte|daun ubi tutuk": `${imageRoot}/SARAWAK_ETHNIC KITCHEN ALA CARTE/SAYUR_UBI_TUTUK.avif`,
  "sarawak-ethnic-kitchen-a-la-carte|umai sarawak": `${imageRoot}/SARAWAK_ETHNIC KITCHEN ALA CARTE/UMAI.avif`,
  "sarawak-highlander-a-la-carte|abbeng arur layun": `${imageRoot}/SARAWAK_HIGHLANDER_ETHNIC_CUISINE_ALA_CARTE/ABBENG_ARUR_LAYUN.avif`,
  "sarawak-highlander-a-la-carte|arur dalan mixed vegetable": `${imageRoot}/SARAWAK_HIGHLANDER_ETHNIC_CUISINE_ALA_CARTE/ARUR_DALAN_MIXED.avif`,
  "sarawak-highlander-a-la-carte|bua’ petar pa’ mada": `${imageRoot}/SARAWAK_HIGHLANDER_ETHNIC_CUISINE_ALA_CARTE/BUA_PETAR_PA_MADA.avif`,
  "sarawak-highlander-a-la-carte|salad": `${imageRoot}/SARAWAK_HIGHLANDER_ETHNIC_CUISINE_ALA_CARTE/HIGHLAND_SALAD.avif`,
  "sarawak-highlander-a-la-carte|kari bua’ kabar": `${imageRoot}/SARAWAK_HIGHLANDER_ETHNIC_CUISINE_ALA_CARTE/KARI_BUA_KABAR.avif`,
  "sarawak-highlander-a-la-carte|labo belatuh pa’ lungan": `${imageRoot}/SARAWAK_HIGHLANDER_ETHNIC_CUISINE_ALA_CARTE/LABO_BETATUH_PA_LUNGAN.avif`,
  "sarawak-highlander-a-la-carte|puluh": `${imageRoot}/SARAWAK_HIGHLANDER_ETHNIC_CUISINE_ALA_CARTE/PULUH.avif`,
  "sarawak-highlander-a-la-carte|soup of young cucumber leaves": `${imageRoot}/SARAWAK_HIGHLANDER_ETHNIC_CUISINE_ALA_CARTE/YOUNG_CUCUMBER_LEAVES_SOUP.avif`,
  "sarawak-highlander-a-la-carte|cucumber juice": `${imageRoot}/DRINKS/CUCUMBER_JUICE.avif`,
};

export function getMenuImage(categorySlug: string, itemName: string): string | null {
  const imagePath = imagePaths[`${categorySlug}|${itemName.toLocaleLowerCase()}`];
  return imagePath ? encodeURI(imagePath) : null;
}
