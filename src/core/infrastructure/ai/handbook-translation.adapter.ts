import type { TranslationAiPort } from '../../application/ports/translation-ai.port';
import type { TranslationResult, TranslationParams } from '../../domain/translation/entity';

export class HandbookTranslationAdapter implements TranslationAiPort {
  public readonly providerName = 'handbook-dictionary';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async translate(params: TranslationParams): Promise<TranslationResult> {
    const { text, targetLang } = params;
    const dictionary: Record<string, Record<string, { trans: string; pron: string }>> = {
      'Xin chào, cho tôi hỏi quán cà phê ngon gần đây nhất ở đâu?': {
        ja: { trans: 'こんにちは、この近くで一番美味しいカフェはどこですか？', pron: 'Konnichiwa, kono chikaku de ichiban oishii kafe wa doko desu ka?' },
        ko: { trans: '안녕하세요, 이 근처에서 가장 맛있는 카페가 어디인가요?', pron: 'Annyeonghaseyo, i geuncheo-eseo gajang mas-issneun kapega eodiingayo?' },
        en: { trans: 'Hello, could you tell me where the best cafe nearby is?', pron: 'He-loh, kood yoo tel mee...' },
        fr: { trans: 'Bonjour, pourriez-vous me dire où se trouve le meilleur café à proximité ?', pron: 'Bon-zhoor...' },
        zh: { trans: '你好，请问附近最好喝的咖啡馆在哪里？', pron: 'Ni hao, qingwen fujin...' },
      },
      'Món này có cay không? Tôi ăn chay': {
        ja: { trans: 'この料理は辛いですか？私はベジタリアンです。', pron: 'Kono ryori wa karai desu ka? Watashi wa bejitarian desu.' },
        ko: { trans: '이 음식은 맵나요? 저는 채식주의자입니다.', pron: 'I eumsig-eun maebnayo? Jeoneun chaesigju-uija-ibnida.' },
        en: { trans: 'Is this dish spicy? I am a vegetarian.', pron: 'Is this dish spicy? I am a vegetarian.' },
        fr: { trans: 'Ce plat est-il épicé ? Je suis végétarien.', pron: 'Se pla et-il e-pi-se? Zhe sui ve-zhe-ta-ri-an.' },
        zh: { trans: '这道菜辣吗？我吃素。', pron: 'Zhe dao cai la ma? Wo chi su.' },
      },
      'Bao nhiêu tiền một vé vào cổng?': {
        ja: { trans: '入場券はいくらですか？', pron: 'Nyujoken wa ikura desu ka?' },
        ko: { trans: '입장권은 얼마인가요?', pron: 'Ibjang-gwoneun eolma-ingayo?' },
        en: { trans: 'How much is an entrance ticket?', pron: 'How much is an entrance ticket?' },
        fr: { trans: 'Combien coûte un billet d\'entrée ?', pron: 'Kohn-byen koot uhn bee-yeh dahn-tray?' },
        zh: { trans: '门票多少钱一张？', pron: 'Menpiao duoshao qian yi zhang?' },
      },
      'Cho tôi xin hóa đơn thanh toán': {
        ja: { trans: 'お会計をお願いします。', pron: 'O-kaikei o onegai shimasu.' },
        ko: { trans: '계산서 부탁드립니다.', pron: 'Gyesanseo butagdeulibnida.' },
        en: { trans: 'Could I please have the bill?', pron: 'Could I please have the bill?' },
        fr: { trans: 'L\'addition, s\'il vous plaît.', pron: 'Lah-dee-syohn, seel voo pleh.' },
        zh: { trans: '买单，谢谢。', pron: 'Maidan, xiexie.' },
      },
    };

    const matched = dictionary[text]?.[targetLang];
    if (matched) {
      return {
        originalText: text,
        translatedText: matched.trans,
        pronunciation: matched.pron,
        targetLang,
        source: this.providerName,
      };
    }

    const fallbacks: Record<string, string> = {
      ja: `「${text}」についての問い合わせです。`,
      ko: `"${text}" 에 대한 번역입니다.`,
      en: `Translation for: "${text}"`,
      fr: `Traduction pour : "${text}"`,
      zh: `"${text}" 的翻译。`,
    };

    return {
      originalText: text,
      translatedText: fallbacks[targetLang] || text,
      targetLang,
      source: 'handbook-fallback',
    };
  }
}
