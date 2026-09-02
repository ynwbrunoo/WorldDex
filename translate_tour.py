import json
import os
import sys
import time
from deep_translator import GoogleTranslator

sys.stdout.reconfigure(encoding='utf-8')

LOCALES_DIR = r"c:\Users\ynwbr\Documents\WorldDex\src\i18n\locales"

PT_TEXT = {
    "skip": "Pular Tutorial",
    "next": "Próximo ➔",
    "prev": "⬅ Anterior",
    "done": "Terminar ✓",
    "progress": "Passo {{current}} de {{total}}",
    "step1": { "title": "👋 Bem-vindo ao WorldDex!", "desc": "Aqui vais colecionar todos os países do mundo através de sorteios baseados na verdadeira taxa de natalidade global. Vamos ver como funciona?" },
    "step2": { "title": "🎲 Rolar Pelo Mundo", "desc": "Clica neste botão (ou pressiona Espaço) para girares. A probabilidade de te calhar um país é <b>exatamente igual à probabilidade de nasceres lá</b> no mundo real. Quanto mais nascimentos, mais comum!" },
    "step3": { "title": "🗺️ O Teu Mapa", "desc": "Sempre que desbloqueares um país novo, ele será pintado no mapa com a cor da sua raridade (Comum, Incomum, Raro, Épico ou Lendário)." },
    "step4": { "title": "💖 Sistema de Pity", "desc": "Cada vez que te calha um duplicado, a barra de sorte sobe. Quando chegar ao máximo, o próximo giro é <b>100% garantido</b> de ser um país que ainda não tens!" },
    "step5": { "title": "🛒 Loja & Economia", "desc": "Não te preocupes com os duplicados. Cada país repetido dá-te <b>moedas</b> (dependendo da sua raridade). Podes usar moedas nesta Loja para <b>comprar países em falta</b> ou <b>Upgrades</b> (como o Autoclicker ou multiplicadores)." },
    "step6": { "title": "📚 A Tua Coleção", "desc": "Nesta aba podes ver todos os países que já tiraste e quantos te faltam. Podes clicar neles para veres detalhes e curiosidades." },
    "step7": { "title": "🏆 Conquistas", "desc": "Completa continentes, forma grupos de países específicos (como a CPLP ou União Europeia) e alcança metas para desbloquear estas conquistas únicas." },
    "step8": { "title": "🌍 Pronto a Jogar!", "desc": "Agora é contigo! Boa sorte na tua jornada para desbloquear o mundo inteiro, um nascimento de cada vez." }
}

MANUAL_TRANSLATIONS = {
    "pt-PT": PT_TEXT,
    "pt-BR": {
        "skip": "Pular Tutorial", "next": "Próximo ➔", "prev": "⬅ Anterior", "done": "Terminar ✓", "progress": "Passo {{current}} de {{total}}",
        "step1": { "title": "👋 Bem-vindo ao WorldDex!", "desc": "Aqui você vai colecionar todos os países do mundo através de sorteios baseados na verdadeira taxa de natalidade global. Vamos ver como funciona?" },
        "step2": { "title": "🎲 Rolar Pelo Mundo", "desc": "Clique neste botão (ou pressione Espaço) para girar. A probabilidade de você tirar um país é <b>exatamente igual à probabilidade de você nascer lá</b> no mundo real. Quanto mais nascimentos, mais comum!" },
        "step3": { "title": "🗺️ O Seu Mapa", "desc": "Sempre que você desbloquear um país novo, ele será pintado no mapa com a cor da sua raridade (Comum, Incomum, Raro, Épico ou Lendário)." },
        "step4": { "title": "💖 Sistema de Pity", "desc": "Cada vez que você tira um duplicado, a barra de sorte sobe. Quando chegar ao máximo, o próximo giro é <b>100% garantido</b> de ser um país que você ainda não tem!" },
        "step5": { "title": "🛒 Loja & Economia", "desc": "Não se preocupe com os duplicados. Cada país repetido te dá <b>moedas</b> (dependendo da sua raridade). Você pode usar moedas nesta Loja para <b>comprar países em falta</b> ou <b>Upgrades</b> (como o Autoclicker ou multiplicadores)." },
        "step6": { "title": "📚 A Sua Coleção", "desc": "Nesta aba você pode ver todos os países que já tirou e quantos faltam. Você pode clicar neles para ver detalhes e curiosidades." },
        "step7": { "title": "🏆 Conquistas", "desc": "Complete continentes, forme grupos de países específicos (como a CPLP ou União Europeia) e alcance metas para desbloquear estas conquistas únicas." },
        "step8": { "title": "🌍 Pronto para Jogar!", "desc": "Agora é com você! Boa sorte na sua jornada para desbloquear o mundo inteiro, um nascimento de cada vez." }
    },
    "cv": {
        "skip": "Pula Tutorial", "next": "Próximu ➔", "prev": "⬅ Anterior", "done": "Termina ✓", "progress": "Pasu {{current}} di {{total}}",
        "step1": { "title": "👋 Benvindu na WorldDex!", "desc": "Li bu ta kolesiona tudu país di mundu através di sorti baseadu na taxa di natalidadi verdaderu. Nu ba odja modi ki ta fonsiona?" },
        "step2": { "title": "🎲 Rola Pelo Mundu", "desc": "Klika nes boton (ô karka Spasu) pa bu gira. Probabilidadi di bu ganha un país é <b>izatamente igual probabilidadi di bu nase lá</b> na mundu real. Kantu mas nasimentu, mas komun!" },
        "step3": { "title": "🗺️ Bu Mapa", "desc": "Sempri ki bu disblokeia un país novu, e ta pintadu na mapa ku kor di se raridadi (Komun, Inkomun, Raru, Épiku ô Lenda)." },
        "step4": { "title": "💖 Sistema di Pity", "desc": "Kada bês ki bu ganha un duplikadu, barra di sorti ta subi. Kantu e txiga masimu, prosimu giru é <b>100% garantidu</b> di ser un país ki bu ka ten inda!" },
        "step5": { "title": "🛒 Loja & Ikonomia", "desc": "Ka bu preokupa ku duplikadus. Kada país repetidu ta dau <b>moédas</b> (dipendendu di se raridadi). Bu podi uza moédas nes Loja pa <b>kunpra país ki ta falta</b> ô <b>Upgrades</b>." },
        "step6": { "title": "📚 Bu Koleson", "desc": "Nes aba bu podi odja tudu país ki bu dja tira y kantu ki ta faltau. Bu podi klika nês pa bu odja ditalhis y kuriozidadis." },
        "step7": { "title": "🏆 Konkistas", "desc": "Kunpleta kontinentis, forma grupus di país ispesifiku y alkansa metas pa disblokeia es konkistas uniku." },
        "step8": { "title": "🌍 Prontu pa Djuga!", "desc": "Gosi é ku bo! Boa sorti na bu jornada pa disblokeia mundu interu, un nasimentu di kada bês." }
    },
    "kmb": {
        "skip": "Lutuka ulongelu", "next": "Kumbandu ➔", "prev": "⬅ Kudima", "done": "Bhua ✓", "progress": "Kibhanga {{current}} kia {{total}}",
        "step1": { "title": "👋 Menekenu ku WorldDex!", "desc": "Muku muku u tena kukongeka ifuxi yoso ya ngongo mu kusola. Tu tale kyebhi ki bhanga?" },
        "step2": { "title": "🎲 Rola Pelo Mundu", "desc": "Banda bhoxi dia botá (mba Espaço) phala kuzunga. Kyebhi kya kuxikina ixi ki <b>difu ni kuvwaluka ku ngongo</b>. Kyavulu kya vwaluka, ki dimuka!" },
        "step3": { "title": "🗺️ O Mapa Yé", "desc": "Kyoso ki u jikula ixi yobhe, ya-nda zuka ku mapa ni kixibhu kya kukamba (Kyadifu, Kiyadifu, Kikamba, Ixi)." },
        "step4": { "title": "💖 Sistema ya Pity", "desc": "Kyoso ki u kwata ixi yadikwa, o kixibhu kya mbote ki bandeka. Ki ki zubha, o kuzunga kwakà <b>100% kwakixikina</b> ixi i u kambe n'yo!" },
        "step5": { "title": "🛒 Loja & Economia", "desc": "U kamba u thanda ni yadikwa. Ixi i u kwata i kubhana <b>kitadi</b>. U tena kuzwa kitadi ku Loja ku <b>kusumba ixi</b> mba <b>Kubandekesa</b>." },
        "step6": { "title": "📚 O Kibuka Kyé", "desc": "Ku kaxi u tena kutala ifuxi yoso i u kwata. U tena kukwata-dhi phala kumona ibhangelu." },
        "step7": { "title": "🏆 Ikwatenu", "desc": "Zubha itanda, bhanga ibuka ya ifuxi u kambe kumona." },
        "step8": { "title": "🌍 Kilwaza phala kwimaba!", "desc": "Kindala nyé! Mbote ya kuxikina kwé phala kujikula o ngongo yoso, kuvwaluka kumoxi." }
    },
    "umb": {
        "skip": "Pita Tutorial", "next": "Kovaso ➔", "prev": "⬅ Konyima", "done": "Sula ✓", "progress": "Ondjo {{current}} ya {{total}}",
        "step1": { "title": "👋 Kalunga ku WorldDex!", "desc": "Kulo oka kongela ofeka yosi voluali loku sokisa oku citiwa. Tu tala ndati ci lingiwa?" },
        "step2": { "title": "🎲 Rola Vokuenda Kuoluali", "desc": "Veta kulo (ale Espaço) oco o pui. Esunga lioku mola ofeka li <b>sokile lesunga lioku citiwa kulo</b> voluali lwocili. Nda kuli oku citiwa kwalwa, kulinga ciwa!" },
        "step3": { "title": "🗺️ Mapa Yove", "desc": "Eci o yikula ofeka yokaliye, yi nyaniwa komapa levala lialio (Comum, Incomum, Raro, Épico ale Lendário)." },
        "step4": { "title": "💖 Ongusu yo Pity", "desc": "Eci ofeka yi pituluka, ongusu yi londa. Eci yi tẽla, oku puiwa kukuãmo <b>100% cisokile</b> okuti ofeka yimwe kua kuatele!" },
        "step5": { "title": "🛒 Ocitanda & Eteko", "desc": "Kuka kuate ohele lovi pitulukwa. Ofeka yi pituluka yi kwĩha <b>olombongo</b>. Oka feto kulo <b>oku landa ofeka yo kamba</b> ale <b>Olonene</b>." },
        "step6": { "title": "📚 Ocisoko Cove", "desc": "Kulo oka tala ofeka yosi wamola. Veta kuvo oco o tale ovina vi komõhisa." },
        "step7": { "title": "🏆 Uvangi", "desc": "Tẽlisa ofeka, linga ovimunga vi ofeka noke tẽla ovisoko." },
        "step8": { "title": "🌍 Posi Oku Imba!", "desc": "Cilo kokuove! Ongusu kulo koku yikula oluali lwosi, umue komuenyo." }
    },
    "kg": {
        "skip": "Luta Nlongi", "next": "Nlandu ➔", "prev": "⬅ Nima", "done": "Manisa ✓", "progress": "Ndambu {{current}} ya {{total}}",
        "step1": { "title": "👋 Luwawanu ku WorldDex!", "desc": "Awa si wa vukika nsi zonso za nza. Tu tala nki mutindu bi salaka?" },
        "step2": { "title": "🎲 Zunga muna Nza", "desc": "Nika vava (vo Espaço) muna zunga. Lendo kia baka nsi <b>ki fwanani ye lendo kia wutuka kuna</b> muna nza. Kwandi kwina luwutuku lwingi, kuluta zayakana!" },
        "step3": { "title": "🗺️ Mapa a Kuaku", "desc": "Kansi wa zibula nsi a mpa, i si yitikwa muna mapa ye langi dia kinswaku." },
        "step4": { "title": "💖 Ndungidi a Pity", "desc": "Diaka dia baka moko, ngolo za zuka zi matanga. Kansi i manisi, zunga ki landa kina <b>100% kieleka</b> kia nsi kwa kondele!" },
        "step5": { "title": "🛒 Zandu & Mbongo", "desc": "Kuyindulangi mpasi za mbakami. Nsi i vutukila si ki ku vana <b>mbongo</b>. Lenda sadila mbongo muna Zandu mu <b>sumba nsi zina zi kondolo</b> vo <b>Matombola</b>." },
        "step6": { "title": "📚 Luvukiku lwaku", "desc": "Muna kuka kiaki si wa tala nsi zonso zina wa baka. Lenda nika zo mu mona mambu mampa." },
        "step7": { "title": "🏆 Nzabakani", "desc": "Manisa mazunga, vanga buka ya nsi muna baka nzabakani zazi." },
        "step8": { "title": "🌍 Wa kubama mu Sakana!", "desc": "Wau ya ngeye! Mambu mambote muna nzila a zibula nza yawonso, luwutuku lumosi." }
    }
}

def translate_dict(d, translator):
    result = {}
    for k, v in d.items():
        if isinstance(v, dict):
            result[k] = translate_dict(v, translator)
        else:
            try:
                # deep-translator has trouble with some emojis or short strings sometimes.
                # If it fails, fallback to the original Portuguese text for that string
                translated = translator.translate(v)
                result[k] = translated if translated else v
            except Exception as e:
                # Silently fallback to avoid breaking the whole translation process
                result[k] = v
    return result

def main():
    for fname in os.listdir(LOCALES_DIR):
        if not fname.endswith(".json"):
            continue
        
        lang = fname.replace(".json", "")
        filepath = os.path.join(LOCALES_DIR, fname)
        
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        if lang in MANUAL_TRANSLATIONS:
            print(f"Applying manual translation for {lang}")
            data["tour"] = MANUAL_TRANSLATIONS[lang]
        else:
            gt_lang = lang
            if gt_lang == 'zh': gt_lang = 'zh-CN'
            if gt_lang == 'he': gt_lang = 'iw'
            
            try:
                translator = GoogleTranslator(source='pt', target=gt_lang)
                print(f"Translating for {lang}...")
                translated_tour = translate_dict(PT_TEXT, translator)
                # Fix up placeholders if they get messed up by GT
                if translated_tour.get("progress"):
                    translated_tour["progress"] = translated_tour["progress"].replace("{ {", "{{").replace("} }", "}}")
                data["tour"] = translated_tour
            except Exception as e:
                print(f"Failed to auto-translate for {lang}, using PT fallback.")
                data["tour"] = PT_TEXT
                
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
    print("Done!")

if __name__ == "__main__":
    main()
