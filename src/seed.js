// Boards loaded into a fresh deployment. After that, edit them in the game at /#edit (needs ADMIN_KEY).
export const SEED_BOARDS = {
    "main":  {
                 "title":  "BarHopoly",
                 "area":  "Hoboken, NJ - Downtown Loop",
                 "city":  "Hoboken, NJ",
                 "blocks":  [
                                {
                                    "color":  "g6",
                                    "id":  "b1",
                                    "name":  "Upper Washington"
                                },
                                {
                                    "color":  "g8",
                                    "id":  "b2",
                                    "name":  "Washington \u0026 3rd"
                                },
                                {
                                    "color":  "g1",
                                    "id":  "b3",
                                    "name":  "Lower Washington"
                                },
                                {
                                    "color":  "g2",
                                    "id":  "b4",
                                    "name":  "2nd \u0026 Bloomfield"
                                },
                                {
                                    "color":  "g4",
                                    "id":  "b5",
                                    "name":  "Park \u0026 Garden"
                                }
                            ],
                 "spaces":  [
                                {
                                    "id":  "s0",
                                    "name":  "Pregame",
                                    "type":  "start"
                                },
                                {
                                    "addr":  "531 Washington St",
                                    "block":  "b1",
                                    "id":  "s1",
                                    "name":  "Farside Tavern",
                                    "type":  "bar"
                                },
                                {
                                    "addr":  "333 Washington St",
                                    "block":  "b1",
                                    "id":  "s3",
                                    "name":  "The Cuban",
                                    "type":  "bar"
                                },
                                {
                                    "deck":  "pharmacy",
                                    "id":  "s2",
                                    "name":  "The Pharmacy",
                                    "type":  "card"
                                },
                                {
                                    "id":  "s5",
                                    "name":  "Go to AA",
                                    "type":  "jail"
                                },
                                {
                                    "addr":  "329 Washington St",
                                    "block":  "b2",
                                    "id":  "s4",
                                    "name":  "Louise \u0026 Jerry\u0027s",
                                    "type":  "bar"
                                },
                                {
                                    "addr":  "237 Washington St",
                                    "block":  "b2",
                                    "id":  "s6",
                                    "name":  "Arthur\u0027s Tavern",
                                    "type":  "bar"
                                },
                                {
                                    "addr":  "221 Washington St",
                                    "block":  "b3",
                                    "id":  "s7",
                                    "name":  "Madd Hatter",
                                    "type":  "bar"
                                },
                                {
                                    "id":  "s10",
                                    "name":  "Water Break",
                                    "type":  "rest"
                                },
                                {
                                    "addr":  "215 Washington St",
                                    "block":  "b3",
                                    "id":  "s8",
                                    "name":  "Bahama Mama\u0027s",
                                    "type":  "bar"
                                },
                                {
                                    "addr":  "205 Washington St",
                                    "block":  "b4",
                                    "id":  "s9",
                                    "name":  "Black Bear",
                                    "type":  "bar"
                                },
                                {
                                    "addr":  "239 Bloomfield St",
                                    "block":  "b4",
                                    "id":  "s12",
                                    "name":  "Cork City Pub",
                                    "type":  "bar"
                                },
                                {
                                    "id":  "s15",
                                    "name":  "Go to AA",
                                    "type":  "gotojail"
                                },
                                {
                                    "addr":  "343 Park Ave",
                                    "block":  "b5",
                                    "id":  "s14",
                                    "name":  "Onieal\u0027s",
                                    "type":  "bar"
                                },
                                {
                                    "id":  "s11",
                                    "name":  "Last Call Card",
                                    "type":  "card"
                                },
                                {
                                    "addr":  "501 Garden St",
                                    "block":  "b5",
                                    "id":  "s17",
                                    "name":  "Moran\u0027s Pub",
                                    "type":  "bar"
                                }
                            ]
             },
    "williamsburg":  {
                         "title":  "BarHopoly",
                         "area":  "Williamsburg, Brooklyn - Grand St Loop",
                         "city":  "Brooklyn, NY",
                         "blocks":  [
                                        {
                                            "color":  "g5",
                                            "id":  "b1",
                                            "name":  "Ainslie St"
                                        },
                                        {
                                            "color":  "g2",
                                            "id":  "b2",
                                            "name":  "Grand \u0026 Leonard"
                                        },
                                        {
                                            "color":  "g3",
                                            "id":  "b3",
                                            "name":  "Grand \u0026 Lorimer"
                                        },
                                        {
                                            "color":  "g7",
                                            "id":  "b4",
                                            "name":  "Grand St Central"
                                        },
                                        {
                                            "color":  "g1",
                                            "id":  "b5",
                                            "name":  "Grand \u0026 Union"
                                        },
                                        {
                                            "color":  "g6",
                                            "id":  "b6",
                                            "name":  "Union Ave"
                                        }
                                    ],
                         "spaces":  [
                                        {
                                            "id":  "s0",
                                            "name":  "Pregame",
                                            "type":  "start"
                                        },
                                        {
                                            "addr":  "76 Ainslie St",
                                            "block":  "b1",
                                            "id":  "s1",
                                            "name":  "Ainslie",
                                            "type":  "bar"
                                        },
                                        {
                                            "deck":  "pharmacy",
                                            "id":  "s2",
                                            "name":  "The Pharmacy",
                                            "type":  "card"
                                        },
                                        {
                                            "addr":  "618 Grand St",
                                            "block":  "b2",
                                            "id":  "s6",
                                            "name":  "Bushwick Country Club",
                                            "type":  "bar"
                                        },
                                        {
                                            "id":  "s5",
                                            "name":  "Go to AA",
                                            "type":  "jail"
                                        },
                                        {
                                            "addr":  "596 Grand St",
                                            "block":  "b2",
                                            "id":  "s7",
                                            "name":  "Starlight Tavern",
                                            "type":  "bar"
                                        },
                                        {
                                            "addr":  "588 Grand St",
                                            "block":  "b3",
                                            "id":  "s9",
                                            "name":  "The Last Call",
                                            "type":  "bar"
                                        },
                                        {
                                            "addr":  "559 Grand St",
                                            "block":  "b3",
                                            "id":  "s11",
                                            "name":  "Ontario",
                                            "type":  "bar"
                                        },
                                        {
                                            "id":  "s10",
                                            "name":  "Water Break",
                                            "type":  "rest"
                                        },
                                        {
                                            "addr":  "533 Grand St",
                                            "block":  "b4",
                                            "id":  "s12",
                                            "name":  "Le Barricou",
                                            "type":  "bar"
                                        },
                                        {
                                            "addr":  "524 Grand St",
                                            "block":  "b4",
                                            "id":  "s13",
                                            "name":  "The Whiskey on Grand",
                                            "type":  "bar"
                                        },
                                        {
                                            "addr":  "511 Grand St",
                                            "block":  "b5",
                                            "id":  "s16",
                                            "name":  "Redd\u0027s",
                                            "type":  "bar"
                                        },
                                        {
                                            "id":  "s15",
                                            "name":  "Go to AA",
                                            "type":  "gotojail"
                                        },
                                        {
                                            "addr":  "506 Grand St",
                                            "block":  "b5",
                                            "id":  "s17",
                                            "name":  "Burnside",
                                            "type":  "bar"
                                        },
                                        {
                                            "addr":  "379 Union Ave",
                                            "block":  "b6",
                                            "id":  "s18",
                                            "name":  "The West",
                                            "type":  "bar"
                                        },
                                        {
                                            "addr":  "388 Union Ave",
                                            "block":  "b6",
                                            "id":  "s19",
                                            "name":  "Barcade",
                                            "type":  "bar"
                                        }
                                    ]
                     }
};
