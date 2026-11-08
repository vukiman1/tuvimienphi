export interface TuoiNamFaq {
  readonly question: string;
  readonly answer: string;
}

export interface TuoiNamArticle {
  readonly slug: string;
  readonly birthYear: number;
  readonly viewYear: number;
  readonly tongQuan: readonly string[];
  readonly saoHanNam: readonly string[];
  readonly saoHanNu: readonly string[];
  readonly menh: readonly string[];
  readonly cuoiNha: readonly string[];
  readonly loiKhuyen: readonly string[];
  readonly faq: readonly TuoiNamFaq[];
  readonly model: string;
  readonly generatedAt: string;
}

export interface ConGiapArticle {
  readonly slug: string;
  readonly chi: number;
  readonly viewYear: number;
  readonly tongQuan: readonly string[];
  readonly tamTai: readonly string[];
  readonly thaiTue: readonly string[];
  readonly xongDat: readonly string[];
  readonly model: string;
  readonly generatedAt: string;
}

export interface TetHubManifest {
  readonly viewYear: number;
  readonly conGiap: readonly string[];
  readonly tuoiNam: readonly string[];
}

export interface TetHubIntro {
  readonly intro: readonly string[];
}
