// Products kept OUT of the Google/Bing/Pinterest/Meta product feeds (they stay on the site).
// Source: owner review of all 484 feed titles on 2026-10-06 (REMOVE = someone else's brand, character,
// real person or restricted item; MAYBE = she chose to leave out for now). Remove an id to put a
// product back. New products are still checked by the brand-term filter in brandTerms.ts.
export const FEED_EXCLUDED_IDS = new Set<string>([
  "cmtstbjb00038ld04ws63owke", // Gremlins Gizmo Figurine Keychain
  "cmo5lvdts001etyw4mxtlsm3q", // Voronoi Pegboard Panel – 200mm x 200mm Ikea Skådis Compatibl
  "cmtstbj9j002wld04y1uamiyl", // Ghostbusters Stay Puft Figurine Keychain
  "cmuel2isv00ckky04pq0jbjhx", // Spyro the Dragon - Geometeric Figurine 20cm
  "cmuel2itb00cnky048ijgudtt", // Spyro the Dragon - Geometeric Figurine 16cm
  "cmo5lvh2b004ityw48hpt8zrj", // Melting Sneaker Wall Art – Drippy Checker Slip-On 3D Printed
  "cmuel2itq00cqky04ly7sv9id", // Spyro the Dragon - Geometeric Figurine 12cm
  "cmuel2iay00b2ky049iiuc1v2", // 'Pizza Hut' Flat Keychain
  "cmo5lvh6d004mtyw4r5z0e6du", // Friends Inspired Door Frame – Iconic Yellow 3D Printed Repli
  "cmuel2ja400ewky04ywkc21du", // Blue M&M Bic LIghter Case
  "cmo5lvlht008qtyw4iik5ifvf", // Flying V 3D Printed Guitar Pick Holder – with Matching Guita
  "cmtstbj40001qld04jebha9aq", // Ahhh! Real Monsters Ickis Flat Keychain
  "cmtstbj4f001tld044v0lchjz", // Animaniacs Pinky & the Brain Flat Keychain
  "cmuel2jcg00f8ky04m7qvnzn6", // Tmnt Michelangelo Bic Light Case
  "cmuel2jcw00fbky04gvkzswxt", // Tmnt Donatello Bic Light Case
  "cmo5lvl9r008ityw4rg066801", // Awesom-O Robot 3D Printed Wall Art – Comedy Parody Collectib
  "cmuel2jdc00feky0408foqgip", // Tmnt Leonardo Bic Light Case
  "cmtstbj5o0022ld0483ezqfx5", // Donkey Kong Figurine Keychain
  "cmo5lvmer009mtyw4gv6myqxp", // Glow in the dark - Slime Blob Bob Character – 3D Printed Wal
  "cmo5lvm2b009atyw4pjz47zkh", // Delorean 3D Printed Wall Sign / Desk Art – Retro Car Display
  "cmuel2jjb00g5ky04zbm47xt6", // Adhd Bic Lighter Case
  "cmuel2jpo00gzky04m0vxqz9f", // Gnome Bic Lighter Case
  "cmuel2jrh00hbky04tmw0hn9g", // Red M&M Bic LIghter Case
  "cmtstbixd000bld04beheqmgz", // Fallout Logo Flat Keychain
  "cmo5lvmzd00a6tyw4hcumd2rj", // test item doggos
  "cmuel2jwh00hnky04gl82hzg1", // Ozzy Osbourne Eating a Bat Figurine
  "cmuel2jxc00htky0473532634", // Jay and Silent Bob Figurines
  "cmuel2ks100hwky04rz2dlq2a", // Towelie Bic Lighter Case
  "cmuel2jtu00hkky04kl0rywhe", // 4:20 Tnt Bic Lighter Case
  "cmuel2gcv00awky04d46v9c6q", // Catdog Flat Keychain
  "cmuel2geh00azky04uvouhqev", // Santa Cruz Screaming Hand Flat Keychain
  "cmtstbjbd003bld046fflzhd1", // Mini Flexi Articulated The Peanuts Charlie Brown
  "cmuel2iw200cwky04np2onqba", // Land Before Time - Spike Figurine
  "cmuel2jak00ezky0455fytwb6", // Green M&M Bic LIghter Case
  "cmuel2jaz00f2ky04l5nzeh98", // Yellow M&M Bic LIghter Case
  "cmuel2jbf00f5ky04oia0qr68", // Orange M&M Bic LIghter Case
  "cmuel2jk800gbky040wzqimff", // 007 Bic Lighter Case
  "cmuel2jli00ghky041ctvpy1r", // Chewbonga - The Wookiee of the Weed Galaxy Figurine
  "cmtstbm7500ktld04hm9exs2g", // Mount Turtlemore Tmnt Figurine
  "cmtstbnrf00xnld04wjtrjnbq", // Weedidas Bic Lighter Case
  "cmtstbm4s00kbld04wy841xh3", // The Grinch Bic LIghter Case
  "cmtstbm5700keld04rpxq4dtx", // Kirby Bic LIghter Case
  "cmtstbm6d00knld0496peazm2", // Spyro the Dragon - Geometeric Figurine 8cm
  "cmtstbm6s00kqld04dg196zp1", // Vintage Corning Ware Casserole Dish Coin Bowl
  "cmtstbm7j00kwld0434nnp6s8", // Star Trek - Mr. Spock Leonard Nimoy Bust Figurine
  "cmtstbm5l00khld04up17v514", // Tmnt Raphael Bic Light Case
  "cmtstbmb300lnld04d4npoen1", // Creature From the Black Lagoon - Flexi Figurine
  "cmtstbmdd00m5ld04yl8lio59", // Bob's Burgers - Bob Belcher Figurine
  "cmtstbmf600mkld04ab6r33ke", // Melting Smiley Face Bic Lighter Case
  "cmtstbmg800mtld04k7dcnbee", // Milwaukee Bic Lighter Case
  "cmtstbmgk00mwld04egjmnv51", // King of Spades Bic Lighter Case
  "cmtstbmi400n8ld043hol39ye", // Gremlin Figurine
  "cmtstbndl00ueld04i1rx9vmx", // Nickelodeon Guts Gold Medal
  "cmtstbmmu00obld04q7p3x9zi", // Queen of Hearts Bic Lighter Case
  "cmtstbmm200o5ld04hgrgouz3", // Bill Murray Figurine
  "cmtstbmn700oeld04ds7i1roj", // 420 Bic Lighter Case
  "cmtstbmoo00oqld04cp4i6976", // Tiki Minion Figurine
  "cmtstbmp100otld0498qlw5fp", // Bombernan / Dyna Blaster Figurine
  "cmtstbmpf00owld0448j31xfc", // Goosebumps - Slappy Bust Figurine
  "cmtstbmq600p2ld04cd8yt9jn", // Spyro the Dragon Skull
  "cmtstbmqj00p5ld04qwmrv5pp", // Brocco-Lee Veggie Ninja Figurine
  "cmtstbmrf00pbld043k21397w", // Biohazard Symbol Bic Lighter Case
  "cmtstbmmg00o8ld041pngjbdg", // Gta Wasted Bic Lighter Case
  "cmtstbmuv00q2ld046vtjca42", // Star Trek - Cute Spock Chibi
  "cmtstbmv800q5ld04f0hqeu8x", // Star Trek - Tall Skinny Spock
  "cmtstbmvk00q8ld04iexy10sy", // Eminem Bust Figurine
  "cmo5lvhur005atyw4yef42n4i", // “Hello There” Retro Sign – Neon Style 3D Printed Room Decor
  "cmtstbmzk00r5ld040nv5ea9j", // Star Trek Lower Decks - Peanut Hamper - Sassiest Bot in Star
  "cmtstbn1c00rkld04sbmcu8uk", // The Ooze! Figurine
  "cmtstbn1p00rnld04j7xfao9z", // Cheech & Chong Bic Lighter Case
  "cmtstbn3400rzld04ubf3xk85", // Pain Stimmer Bic Lighter Case
  "cmtstbn3t00s5ld0406ujyb7w", // Hoodie Bic Lighter Case
  "cmtstbmwz00qkld04w6vpw1cx", // Vans Bic Sleeve - Case
  "cmtstbn5a00shld04swyyviuh", // Homer in a Hedge Bic Lighter Case
  "cmtstbn5o00skld0408p1hz73", // Albert Einstein Bust Glasses Holder
  "cmtstbn6d00sqld04dimykmcr", // Pacman Bic Lighter Case
  "cmtstbn7f00szld04i5or89wc", // Easter Island Moai Stone Head Bic Lighter Case
  "cmtstbndx00uhld04fk67c9qo", // Sinclair Dinosaur Phone Stand
  "cmtstbnbd00twld045hdu846i", // Zombie Golden Girls Bust Figurine Set
  "cmtstbnkd00vzld04ypx0yc85", // Legends of the Hidden Temple - Pendant of Life
  "cmtstbnmk00whld04voegfcd1", // Halo Master Cheeks - Thicc Booty Edition
  "cmtstbnmx00wkld04lrwsfcrc", // Flash Bang Bic Lighter Case
  "cmtstbnn900wnld04vvtfdjxk", // F-bomb Desk Art
  "cmtstbnoc00wwld043x334iie", // Melting Skull Bic Lighter Case
  "cmtstbnoo00wzld04aptmd07j", // Mars Attacks Bic Lighter Case
  "cmtstbnp100x2ld04oa78l8vi", // Gummy Bear Skeleton Bic Lighter Case
  "cmtstbnlh00w8ld04f3tjy8nn", // Bazooka Soldier Pen Holder
  "cmtstbns400xtld04c5dyf8d7", // Screw-It Bic Lighter Case
  "cmtstbnsg00xwld049tx241qq", // Tupac Bic Lighter Case
  "cmtstbnss00xzld047240n1fl", // Playboy Bunny Bic Lighter Case
  "cmtstbnuv00yhld04anbcefgd", // Coca Cola Bic Lighter Case
  "cmtstbnv700ykld04vpli0v9e", // Inspector Gadget Bic Lighter Case
  "cmtstbo3p010hld0473qjg1gr", // Dude Candles! Marshall Guitar Pick Holder (for 10 picks) Tea
  "cmtstbodl012qld044egij80h", // Nightmare Before Christmas Oogie Boogie Articulated Flexi To
  "cmtstbojc013qld04zlp0t46e", // Flexi Articulated Jabba the Hutt
  "cmtstboke013zld04z2hpfs23", // Little Mermaid -Flexi Flounder Articulated Toy -Single Color
  "cmtstboks0142ld04b1hwqx1f", // Finding Nemo - Flexi Dory Fish - Single Color
  "cmtstbouf016bld04jvv0cwll", // 90's Napster Logo Wall Art
  "cmtstboxl0172ld04pfb7o1k5", // Faygo Logo Wall Art
  "cmtstbp3o018hld044xk1jvkr", // Cookie Monster Duck Duck
  "cmtstbqqy01lwld04s8qjach6", // Wonka Logo Wall Art
  "cmtstbqrd01lzld04xcmjs850", // Gta Wasted Wall Art
  "cmtstbqzg01ntld049yqg63p4", // Space Man in Bong
  "cmtstbr2q01okld04kvyb77ks", // Santa Cruz
  "cmtstbpd201akld04to41hwlk", // Halo Master Chief Duck Duck
  "cmo5lvglt0042tyw40e9t5rn0", // Klingon Empire Emblem – Star Trek Inspired 3D Wall Art
  "cmo5lvhqj0056tyw42b7a5y7k", // Smokin' Broccoli Buddy Wall Art – Funny 3D Printed Decor
  "cmo5lvcwo000ityw4usdbvuj5", // Butterfly Knife Flip Fidget
  "cmo5lvhaa004qtyw4gt0w16iz", // Dude Candles! Men in Black Style Ufo Crash Site Tea Light Ho
  "cmtstbpmn01cnld044z29rks8", // Pink Pac Man Ghost Pinky Duck
  "cmtstbro101t5ld04krikngw8", // 90's Darkwing Duck Logo Wall Art
  "cmtstbnfc00utld04maozluxk", // PowerPuff Girls Logo Flat Keychain
  "cmtstbqtn01mhld04sqe1eqc1", // Vans Logo Wall Art
  "cmtstbl7000gnld041kj5fk1w", // Breakfast of Champions Flat Keychain
  "cmtstbllf00gzld04bi3c2s1o", // Don't Panic Flat Keychain
  "cmtstbm9500l8ld04gjt3ih55", // Wtf is Happening - Mtv Themed Flat Keychain
  "cmtstbnti00y5ld04yg07z8gh", // This is Fine Meme Flat Keychain
  "cmtstbnuj00yeld04266c0rwo", // Gears Of War Logo Flat Keychain
  "cmtstbnw600ytld04mxoikjkg", // Grenade Knuckles Flat Keychain
  "cmtstbnx800z2ld0455jzde71", // Opinionated Ghostbusters Flat Keychain
  "cmtstbshu01x2ld049b1sc60t", // Flying V 3D Printed Guitar Pick Holder
  "cmtstbnza00zkld04bfkf8t96", // Goofy Movie - Powerline Flat Keychain
  "cmtstbnzm00znld04rsecm8fn", // Johnny Bravo Flat Keychain
  "cmtstbo0c00ztld04rck9jst8", // Self Defense Keychains - Bunny
  "cmtstbo0x00zwld04y8fdgeux", // Middle Finger Flat Keychain
  "cmtstbo1a00zzld04md1w1be1", // 'Don't Be A Prick' Rude & Funny Flat Keychain
  "cmtstbmqw00p8ld04pjs52bj4", // Zig-Zag Bic Lighter Case
  "cmtstbjx3007zld04jhlyx5ms", // Mini Flexi Articulated Grinch
  "cmtstbms700phld04qo5h362o", // Fallout Vault-Tec Bic Lighter Case
  "cmtstbou20168ld04ijx8koj8", // Classic Mtv Logo Wall Art
  "cmtstbqrq01m2ld04elqriax9", // Walter from The Big Lebowski Wall Art
  "cmtstbnvi00ynld04fq1u1rh4", // Gta Wanted Bic Lighter Case
  "cmtstbs7001vwld04odz2sexc", // Voronoi Pegboard Panel – 200mm x 200mm Ikea Skådis Compatibl
  "cmtstbn7200swld04i8mlavkp", // Mtv Tombstone Figurine
  "cmtstbmh900n2ld04rgz6dxv1", // Tmnt -1987 Foot Soldier Ninja
  "cmtstbqta01meld04kfq1rwoh", // Vans Off the Wall Skateboard Logo Wall Art
  "cmtstbno000wtld04cl1xcdly", // Secret Stash! Giant Ring Pop 'Candy'
  "cmtstbmsy00pnld04bt5mme8g", // Swirly Ice Cream Cone Threaded Stash Jar
  "cmtstbqs201m5ld04o9uczp4v", // Waffle House Logo Wall Art
  "cmtstbqsh01m8ld04mkz4twkj", // Volcom Logo Wall Art
  "cmtstbr1a01o8ld04riyj2tke", // Sega Logo Wall Art
  "cmtstbqxz01nhld04d75p5j9k", // Gta Style Stoned Wall Art
  "cmuel2jjr00g8ky04p7ief109", // Dude Candles! Groot 'Wood' Skull
  "cmtstblyt00izld04qa0q12ex", // Dude Candles! Kirby Tea Light Candle Holder
  "cmtstbqsv01mbld04r3ubg9s1", // Vault-Tec Logo Wall Art
  "cmtstbr3g01oqld04apcy8jim", // Red Bull Logo Wall Art
  "cmtstbrf601r5ld04hj63qb1e", // Johnny Bravo Wall Art
  "cmtstbrr801ttld04qu8jwy4m", // 90'S Cartoon Network Logo Wall Art
  "cmtstbsds01wkld0412ycwsjk", // Melting Vans Wall Art – Drippy Checker Slip-On Wall Art
  "cmtstbseh01wnld04oe8mc1jh", // Big Little Tike's Turtle Ashtray
  "cmtstbsfu01wtld0458a24qhn", // Glow in the dark - Slime Bob Character Kuchi Kopi Wall Art
  "cmtstbsi701x5ld04j96pw5sc", // Faux Plant Stash Jar with Leaf Coasters
  "cmtstbjwr007wld04u443dxlo", // Mini Flexi Articulated Stay Puft
  "cmtstbjxu0085ld04ule86aao", // Mini Flexi Articulated Where's Waldo
  "cmtstbr3v01otld04taho7scn", // Rad Movie Logo Wall Art
  "cmtstbs2v01uzld0438ya1s6a", // Star Trek Alert: Condition Red Wall Art
  "cmtstbovi016kld04nxa22fjo", // Sorry We're Stoned Wall Art
  "cmtstbovv016nld04l8wjb6xf", // A & W Rootbeer Logo Wall Art
  "cmtstbow8016qld04hj6y69kx", // Advisory Extreme Wall Art
  "cmtstbowj016tld0456y08uva", // Dolly Parton Wall Art
  "cmtstboww016wld04m6cxrtqq", // Opinionated Homer Simpson Wall Art
  "cmtstbqu001mkld04yl8wrw5x", // Umbrella Corporation Wall Art
  "cmtstbqvh01mwld04di43apvm", // The Shining Wall Art
  "cmtstbqvv01mzld04gqos6bs2", // 90's The More You Know Logo Wall Art
  "cmtstbqwy01n8ld04ck9bedml", // Sublime Wall Art
  "cmtstbqye01nkld04uw8h16mi", // Spy vs Spy Wall Art
  "cmtstbr4801owld04fjfg3qii", // Powerpuff Girls Logo Wall Art
  "cmtstbr4k01ozld04ynjlnwjs", // Goofy Movie Powerline Max Wall Art
  "cmtstbr4y01p2ld04zlnyhzf7", // Power Rangers Logo Wall Art
  "cmtstbr6f01peld040ud1q13n", // Pizza Hut Logo Wall Art
  "cmtstbr6r01phld04ppl0rm19", // Pink Panther Logo Wall Art
  "cmtstbr7401pkld04ccxpltug", // Paddy's Irish Pub Logo Wall Art
  "cmtstbr7u01pqld04x3r0ozzd", // Ahh Real Monsters - Oblina Wall Art
  "cmtstbr9o01q5ld04kp93gnb8", // Monsters Energy Drink Logo Wall Art
  "cmtstbra201q8ld04qvksrtfl", // McDonald's Arches Logo Wall Art
  "cmtstbrae01qbld04f606dg71", // Halo Master Chief Helmet Wall Art
  "cmtstbras01qeld04wlygl210", // Marvin the Martian Wall Art
  "cmtstbre201qwld04hvk26y5y", // Kool Aid Man Wall Art
  "cmtstbree01qzld04vqp3q61f", // Can't We All Just Get A Bong Wall Art
  "cmtstbrh101rkld04jkeicg20", // Goosebumps Logo Wall Art
  "cmtstbri401rtld04gunac9ap", // Ghostbusters Logo Wall Art
  "cmtstbriu01rzld04kuzvzpl3", // Gears of War Wall Art
  "cmtstbrjk01s5ld04wahwcg94", // Galaga Logo Wall Art
  "cmtstbrjx01s8ld04pee9wigh", // G.I. Joe Logo Wall Art
  "cmtstbrkb01sbld04pmnu6c6i", // Bird Finger Opinionated Skeleton Hand Wall Art
  "cmtstbrlg01skld04vd70a2no", // Doug Life Wall Art
  "cmtstbrlu01snld04gu2d0p6o", // Donkey Kong Wall Art
  "cmtstbrm701sqld04lpll27y7", // Don't Panic Wall Art
  "cmtstbrmk01stld04oi59c4dq", // Diet Coke Logo Wall Art
  "cmtstbrna01szld04wvm8vwxl", // DC Comics Logo Wall Art
  "cmtstbrp601teld04vr9grlap", // Dab Queen Wall Art
  "cmtstbrpz01tkld049ddkcd8h", // Cornhole Logo Wall Art
  "cmtstbrqc01tnld04bb27e4nn", // Old School Comedy Central Logo Wall Art
  "cmtstbrx201u2ld040jjw6eq6", // Bob's Burgers Logo Wall Art
  "cmtstbry001u8ld04mz19yutq", // Black Cat Logo Wall Art
  "cmtstbrz001ubld04nv4vppag", // Bender: Kill All Humans Wall Art
  "cmtstbrzw01uhld04hudb90bm", // Beetlejuice Wall Art
  "cmtstbs0901ukld04ht0qckr6", // Beavis and Butt-Head Logo Wall Art
  "cmtstbs0z01uqld04y591bhyf", // Back to the Future Logo Wall Art
  "cmtstbs1e01utld04gqb2kjjz", // Back 2 the Future Outatime License Plate Wall Art
  "cmtstbs3801v2ld04v4hhek57", // Air Max Shoe Wall Art
  "cmtstbs3l01v5ld04zy1pkatr", // Air Jordan Logo Wall Art
  "cmtstbs3z01v8ld04k2k8j4dy", // AaHH Real Monsters - Krumm Wall Art
  "cmtstbs4q01veld04nap23lh4", // 7-UP Logo Wall Art
  "cmtstbs5401vhld04tu7gq7tm", // 7-11 Logo Wall Art
  "cmtstbs5j01vkld04bvz9vbg2", // Mile Marker 420 Wall Art
  "cmtstbs6a01vqld046kt8ct79", // 007 James Bond Wall Art
  "cmtstbjlf005hld04n04s5y3g", // Mini Flexi Articulated Creature from the Black Lagoon
  "cmtstbjls005kld04z4mq8r5v", // Mini Flexi Articulated Halo Master Chief
  "cmtstbjna005wld04d5iutivd", // Mini Flexi Articulated Ghost Rider
  "cmtstbjoc0065ld04pmv5zjq7", // Mini Flexi Articulated They Live
  "cmtstbjpn006eld04h77kziph", // Mini Flexi Articulated Ted the Bear
  "cmtstbjtg0078ld04sr9i71eu", // Mini Flexi Articulated Mr. Potato Head
  "cmtstbjul007hld04a07ti11l", // Mini Flexi Articulated Gizmo from Gremlins
  "cmtstbjin004wld04wkhwa46j", // Mini Flexi Articulated Albert Einstein
  "cmtstbjuz007kld04rsbpzd0n", // Mini Flexi Articulated Darth Vader
  "cmtstbjvv007qld04qbyeylt0", // Mini Flexi Articulated Elmo
  "cmtstbjwa007tld04fpcv0t4k", // Mini Flexi Articulated Art the Clown
  "cmtstbr0601nzld04uix4d4fs", // Snap-on Tools Logo Wall Art
  "cmtstbr0j01o2ld04juw7zlqm", // Smokey the Bear Wall Art
  "cmtstbr0x01o5ld04pl89ioyd", // Ghostbusters Slimer Wall Art
  "cmtstbjym008bld043sy03cqe", // Mini Flexi Articulated Cookie Monster
  "cmtstbqur01mqld040or6kj1x", // Tmnt Logo Ninja Turles Manhole Cover Wall Art
  "cmtstbr9c01q2ld04rmtc3nv4", // Mtv Logo Wall Art
  "cmtstbs6n01vtld04fcxu2le1", // “Hello There” Catwoman Wall Art
]);
