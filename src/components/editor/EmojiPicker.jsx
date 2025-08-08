import React, { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
// Simple category navigation without tabs component
import { Search } from 'lucide-react'

// Comprehensive emoji data organized by categories
const EMOJI_CATEGORIES = {
    people: {
        label: '😊 People',
        emojis: [
            { emoji: '😀', name: 'grinning face', keywords: ['happy', 'smile', 'grin'] },
            { emoji: '😃', name: 'grinning face with big eyes', keywords: ['happy', 'smile', 'joy'] },
            { emoji: '😄', name: 'grinning face with smiling eyes', keywords: ['happy', 'smile', 'laugh'] },
            { emoji: '😁', name: 'beaming face with smiling eyes', keywords: ['happy', 'smile', 'grin'] },
            { emoji: '😆', name: 'grinning squinting face', keywords: ['laugh', 'happy', 'smile'] },
            { emoji: '😅', name: 'grinning face with sweat', keywords: ['laugh', 'sweat', 'smile'] },
            { emoji: '🤣', name: 'rolling on the floor laughing', keywords: ['laugh', 'rofl', 'funny'] },
            { emoji: '😂', name: 'face with tears of joy', keywords: ['laugh', 'cry', 'happy'] },
            { emoji: '🙂', name: 'slightly smiling face', keywords: ['smile', 'happy'] },
            { emoji: '🙃', name: 'upside-down face', keywords: ['silly', 'sarcasm'] },
            { emoji: '😉', name: 'winking face', keywords: ['wink', 'flirt'] },
            { emoji: '😊', name: 'smiling face with smiling eyes', keywords: ['smile', 'happy', 'blush'] },
            { emoji: '😇', name: 'smiling face with halo', keywords: ['angel', 'innocent'] },
            { emoji: '🥰', name: 'smiling face with hearts', keywords: ['love', 'hearts', 'adore'] },
            { emoji: '😍', name: 'smiling face with heart-eyes', keywords: ['love', 'heart', 'eyes'] },
            { emoji: '🤩', name: 'star-struck', keywords: ['star', 'eyes', 'giddy'] },
            { emoji: '😘', name: 'face blowing a kiss', keywords: ['kiss', 'love'] },
            { emoji: '😗', name: 'kissing face', keywords: ['kiss'] },
            { emoji: '😚', name: 'kissing face with closed eyes', keywords: ['kiss'] },
            { emoji: '😙', name: 'kissing face with smiling eyes', keywords: ['kiss', 'smile'] },
            { emoji: '🥲', name: 'smiling face with tear', keywords: ['tear', 'smile', 'bittersweet'] },
            { emoji: '😋', name: 'face savoring food', keywords: ['tongue', 'yum', 'delicious'] },
            { emoji: '😛', name: 'face with tongue', keywords: ['tongue', 'playful'] },
            { emoji: '😜', name: 'winking face with tongue', keywords: ['wink', 'tongue', 'playful'] },
            { emoji: '🤪', name: 'zany face', keywords: ['crazy', 'goofy'] },
            { emoji: '😝', name: 'squinting face with tongue', keywords: ['tongue', 'playful'] },
            { emoji: '🤑', name: 'money-mouth face', keywords: ['money', 'dollar'] },
            { emoji: '🤗', name: 'hugging face', keywords: ['hug', 'embrace'] },
            { emoji: '🤭', name: 'face with hand over mouth', keywords: ['secret', 'oops'] },
            { emoji: '🤫', name: 'shushing face', keywords: ['quiet', 'secret'] },
            { emoji: '🤔', name: 'thinking face', keywords: ['think', 'hmm'] },
            { emoji: '🤐', name: 'zipper-mouth face', keywords: ['quiet', 'secret'] },
            { emoji: '🤨', name: 'face with raised eyebrow', keywords: ['suspicious', 'skeptical'] },
            { emoji: '😐', name: 'neutral face', keywords: ['neutral', 'meh'] },
            { emoji: '😑', name: 'expressionless face', keywords: ['blank', 'meh'] },
            { emoji: '😶', name: 'face without mouth', keywords: ['silence', 'quiet'] },
            { emoji: '😏', name: 'smirking face', keywords: ['smirk', 'smug'] },
            { emoji: '😒', name: 'unamused face', keywords: ['unimpressed', 'meh'] },
            { emoji: '🙄', name: 'face with rolling eyes', keywords: ['eye roll', 'annoyed'] },
            { emoji: '😬', name: 'grimacing face', keywords: ['grimace', 'awkward'] },
            { emoji: '🤥', name: 'lying face', keywords: ['lie', 'pinocchio'] },
            { emoji: '😔', name: 'pensive face', keywords: ['sad', 'dejected'] },
            { emoji: '😪', name: 'sleepy face', keywords: ['tired', 'sleepy'] },
            { emoji: '🤤', name: 'drooling face', keywords: ['drool', 'hungry'] },
            { emoji: '😴', name: 'sleeping face', keywords: ['sleep', 'zzz'] },
            { emoji: '😷', name: 'face with medical mask', keywords: ['sick', 'mask'] },
            { emoji: '🤒', name: 'face with thermometer', keywords: ['sick', 'fever'] },
            { emoji: '🤕', name: 'face with head-bandage', keywords: ['hurt', 'injured'] },
            { emoji: '🤢', name: 'nauseated face', keywords: ['sick', 'nausea'] },
            { emoji: '🤮', name: 'face vomiting', keywords: ['sick', 'puke'] },
            { emoji: '🤧', name: 'sneezing face', keywords: ['sneeze', 'sick'] },
            { emoji: '🥵', name: 'hot face', keywords: ['hot', 'heat'] },
            { emoji: '🥶', name: 'cold face', keywords: ['cold', 'freeze'] },
            { emoji: '🥴', name: 'woozy face', keywords: ['dizzy', 'drunk'] },
            { emoji: '😵', name: 'dizzy face', keywords: ['dizzy', 'confused'] },
            { emoji: '🤯', name: 'exploding head', keywords: ['mind blown', 'shock'] },
            { emoji: '🤠', name: 'cowboy hat face', keywords: ['cowboy', 'hat'] },
            { emoji: '🥳', name: 'partying face', keywords: ['party', 'celebration'] },
            { emoji: '🥸', name: 'disguised face', keywords: ['disguise', 'incognito'] },
            { emoji: '😎', name: 'smiling face with sunglasses', keywords: ['cool', 'sunglasses'] },
            { emoji: '🤓', name: 'nerd face', keywords: ['nerd', 'geek'] },
            { emoji: '🧐', name: 'face with monocle', keywords: ['monocle', 'posh'] }
        ]
    },
    animals: {
        label: '🐶 Animals',
        emojis: [
            { emoji: '🐶', name: 'dog face', keywords: ['dog', 'puppy', 'pet'] },
            { emoji: '🐱', name: 'cat face', keywords: ['cat', 'kitten', 'pet'] },
            { emoji: '🐭', name: 'mouse face', keywords: ['mouse', 'rodent'] },
            { emoji: '🐹', name: 'hamster face', keywords: ['hamster', 'pet'] },
            { emoji: '🐰', name: 'rabbit face', keywords: ['rabbit', 'bunny'] },
            { emoji: '🦊', name: 'fox face', keywords: ['fox', 'sly'] },
            { emoji: '🐻', name: 'bear face', keywords: ['bear'] },
            { emoji: '🐼', name: 'panda face', keywords: ['panda', 'bear'] },
            { emoji: '🐨', name: 'koala', keywords: ['koala', 'bear'] },
            { emoji: '🐯', name: 'tiger face', keywords: ['tiger', 'cat'] },
            { emoji: '🦁', name: 'lion face', keywords: ['lion', 'cat'] },
            { emoji: '🐮', name: 'cow face', keywords: ['cow', 'cattle'] },
            { emoji: '🐷', name: 'pig face', keywords: ['pig', 'pork'] },
            { emoji: '🐽', name: 'pig nose', keywords: ['pig', 'nose'] },
            { emoji: '🐸', name: 'frog face', keywords: ['frog', 'amphibian'] },
            { emoji: '🐵', name: 'monkey face', keywords: ['monkey', 'primate'] },
            { emoji: '🙈', name: 'see-no-evil monkey', keywords: ['monkey', 'see', 'evil'] },
            { emoji: '🙉', name: 'hear-no-evil monkey', keywords: ['monkey', 'hear', 'evil'] },
            { emoji: '🙊', name: 'speak-no-evil monkey', keywords: ['monkey', 'speak', 'evil'] },
            { emoji: '🐒', name: 'monkey', keywords: ['monkey', 'primate'] },
            { emoji: '🐔', name: 'chicken', keywords: ['chicken', 'bird'] },
            { emoji: '🐧', name: 'penguin', keywords: ['penguin', 'bird'] },
            { emoji: '🐦', name: 'bird', keywords: ['bird'] },
            { emoji: '🐤', name: 'baby chick', keywords: ['chick', 'baby', 'bird'] },
            { emoji: '🐣', name: 'hatching chick', keywords: ['chick', 'hatching', 'bird'] },
            { emoji: '🐥', name: 'front-facing baby chick', keywords: ['chick', 'baby', 'bird'] },
            { emoji: '🦆', name: 'duck', keywords: ['duck', 'bird'] },
            { emoji: '🦅', name: 'eagle', keywords: ['eagle', 'bird'] },
            { emoji: '🦉', name: 'owl', keywords: ['owl', 'bird'] },
            { emoji: '🦇', name: 'bat', keywords: ['bat', 'vampire'] },
            { emoji: '🐺', name: 'wolf face', keywords: ['wolf', 'dog'] },
            { emoji: '🐗', name: 'boar', keywords: ['boar', 'pig'] },
            { emoji: '🐴', name: 'horse face', keywords: ['horse', 'equine'] },
            { emoji: '🦄', name: 'unicorn face', keywords: ['unicorn', 'fantasy'] },
            { emoji: '🐝', name: 'honeybee', keywords: ['bee', 'insect'] },
            { emoji: '🐛', name: 'bug', keywords: ['bug', 'insect'] },
            { emoji: '🦋', name: 'butterfly', keywords: ['butterfly', 'insect'] },
            { emoji: '🐌', name: 'snail', keywords: ['snail', 'slow'] },
            { emoji: '🐞', name: 'lady beetle', keywords: ['ladybug', 'insect'] },
            { emoji: '🐜', name: 'ant', keywords: ['ant', 'insect'] },
            { emoji: '🦗', name: 'cricket', keywords: ['cricket', 'insect'] },
            { emoji: '🕷️', name: 'spider', keywords: ['spider', 'insect'] },
            { emoji: '🦂', name: 'scorpion', keywords: ['scorpion', 'arachnid'] },
            { emoji: '🐢', name: 'turtle', keywords: ['turtle', 'slow'] },
            { emoji: '🐍', name: 'snake', keywords: ['snake', 'reptile'] },
            { emoji: '🦎', name: 'lizard', keywords: ['lizard', 'reptile'] },
            { emoji: '🦖', name: 'T-Rex', keywords: ['dinosaur', 'trex'] },
            { emoji: '🦕', name: 'sauropod', keywords: ['dinosaur', 'long neck'] },
            { emoji: '🐙', name: 'octopus', keywords: ['octopus', 'sea'] },
            { emoji: '🦑', name: 'squid', keywords: ['squid', 'sea'] },
            { emoji: '🦐', name: 'shrimp', keywords: ['shrimp', 'seafood'] },
            { emoji: '🦞', name: 'lobster', keywords: ['lobster', 'seafood'] },
            { emoji: '🦀', name: 'crab', keywords: ['crab', 'seafood'] },
            { emoji: '🐡', name: 'blowfish', keywords: ['fish', 'pufferfish'] },
            { emoji: '🐠', name: 'tropical fish', keywords: ['fish', 'tropical'] },
            { emoji: '🐟', name: 'fish', keywords: ['fish'] },
            { emoji: '🐬', name: 'dolphin', keywords: ['dolphin', 'sea'] },
            { emoji: '🐳', name: 'spouting whale', keywords: ['whale', 'sea'] },
            { emoji: '🐋', name: 'whale', keywords: ['whale', 'sea'] },
            { emoji: '🦈', name: 'shark', keywords: ['shark', 'sea'] },
            { emoji: '🐊', name: 'crocodile', keywords: ['crocodile', 'alligator'] }
        ]
    },
    food: {
        label: '🍎 Food',
        emojis: [
            { emoji: '🍎', name: 'red apple', keywords: ['apple', 'fruit'] },
            { emoji: '🍏', name: 'green apple', keywords: ['apple', 'fruit', 'green'] },
            { emoji: '🍊', name: 'tangerine', keywords: ['orange', 'fruit'] },
            { emoji: '🍋', name: 'lemon', keywords: ['lemon', 'fruit', 'sour'] },
            { emoji: '🍌', name: 'banana', keywords: ['banana', 'fruit'] },
            { emoji: '🍉', name: 'watermelon', keywords: ['watermelon', 'fruit'] },
            { emoji: '🍇', name: 'grapes', keywords: ['grapes', 'fruit'] },
            { emoji: '🍓', name: 'strawberry', keywords: ['strawberry', 'fruit'] },
            { emoji: '🫐', name: 'blueberries', keywords: ['blueberry', 'fruit'] },
            { emoji: '🍈', name: 'melon', keywords: ['melon', 'fruit'] },
            { emoji: '🍒', name: 'cherries', keywords: ['cherry', 'fruit'] },
            { emoji: '🍑', name: 'peach', keywords: ['peach', 'fruit'] },
            { emoji: '🥭', name: 'mango', keywords: ['mango', 'fruit'] },
            { emoji: '🍍', name: 'pineapple', keywords: ['pineapple', 'fruit'] },
            { emoji: '🥥', name: 'coconut', keywords: ['coconut', 'fruit'] },
            { emoji: '🥝', name: 'kiwi fruit', keywords: ['kiwi', 'fruit'] },
            { emoji: '🍅', name: 'tomato', keywords: ['tomato', 'vegetable'] },
            { emoji: '🍆', name: 'eggplant', keywords: ['eggplant', 'vegetable'] },
            { emoji: '🥑', name: 'avocado', keywords: ['avocado', 'fruit'] },
            { emoji: '🥦', name: 'broccoli', keywords: ['broccoli', 'vegetable'] },
            { emoji: '🥬', name: 'leafy greens', keywords: ['lettuce', 'vegetable'] },
            { emoji: '🥒', name: 'cucumber', keywords: ['cucumber', 'vegetable'] },
            { emoji: '🌶️', name: 'hot pepper', keywords: ['pepper', 'spicy', 'hot'] },
            { emoji: '🫑', name: 'bell pepper', keywords: ['pepper', 'vegetable'] },
            { emoji: '🌽', name: 'ear of corn', keywords: ['corn', 'vegetable'] },
            { emoji: '🥕', name: 'carrot', keywords: ['carrot', 'vegetable'] },
            { emoji: '🫒', name: 'olive', keywords: ['olive', 'fruit'] },
            { emoji: '🧄', name: 'garlic', keywords: ['garlic', 'vegetable'] },
            { emoji: '🧅', name: 'onion', keywords: ['onion', 'vegetable'] },
            { emoji: '🥔', name: 'potato', keywords: ['potato', 'vegetable'] },
            { emoji: '🍠', name: 'roasted sweet potato', keywords: ['sweet potato', 'vegetable'] },
            { emoji: '🥐', name: 'croissant', keywords: ['croissant', 'bread'] },
            { emoji: '🥖', name: 'baguette bread', keywords: ['bread', 'baguette'] },
            { emoji: '🫓', name: 'flatbread', keywords: ['bread', 'flatbread'] },
            { emoji: '🥨', name: 'pretzel', keywords: ['pretzel', 'snack'] },
            { emoji: '🥯', name: 'bagel', keywords: ['bagel', 'bread'] },
            { emoji: '🥞', name: 'pancakes', keywords: ['pancake', 'breakfast'] },
            { emoji: '🧇', name: 'waffle', keywords: ['waffle', 'breakfast'] },
            { emoji: '🧀', name: 'cheese wedge', keywords: ['cheese', 'dairy'] },
            { emoji: '🍖', name: 'meat on bone', keywords: ['meat', 'bone'] },
            { emoji: '🍗', name: 'poultry leg', keywords: ['chicken', 'meat'] },
            { emoji: '🥩', name: 'cut of meat', keywords: ['meat', 'steak'] },
            { emoji: '🥓', name: 'bacon', keywords: ['bacon', 'meat'] },
            { emoji: '🍔', name: 'hamburger', keywords: ['burger', 'food'] },
            { emoji: '🍟', name: 'french fries', keywords: ['fries', 'food'] },
            { emoji: '🍕', name: 'pizza', keywords: ['pizza', 'food'] },
            { emoji: '🌭', name: 'hot dog', keywords: ['hot dog', 'food'] },
            { emoji: '🥪', name: 'sandwich', keywords: ['sandwich', 'food'] },
            { emoji: '🌮', name: 'taco', keywords: ['taco', 'mexican'] },
            { emoji: '🌯', name: 'burrito', keywords: ['burrito', 'mexican'] },
            { emoji: '🫔', name: 'tamale', keywords: ['tamale', 'mexican'] },
            { emoji: '🥙', name: 'stuffed flatbread', keywords: ['flatbread', 'stuffed'] },
            { emoji: '🧆', name: 'falafel', keywords: ['falafel', 'food'] },
            { emoji: '🥚', name: 'egg', keywords: ['egg', 'breakfast'] },
            { emoji: '🍳', name: 'cooking', keywords: ['cooking', 'egg', 'frying'] },
            { emoji: '🥘', name: 'shallow pan of food', keywords: ['pan', 'cooking'] },
            { emoji: '🍲', name: 'pot of food', keywords: ['pot', 'stew'] },
            { emoji: '🫕', name: 'fondue', keywords: ['fondue', 'cheese'] },
            { emoji: '🥣', name: 'bowl with spoon', keywords: ['bowl', 'cereal'] },
            { emoji: '🥗', name: 'green salad', keywords: ['salad', 'healthy'] },
            { emoji: '🍿', name: 'popcorn', keywords: ['popcorn', 'snack'] },
            { emoji: '🧈', name: 'butter', keywords: ['butter', 'dairy'] },
            { emoji: '🧂', name: 'salt', keywords: ['salt', 'seasoning'] },
            { emoji: '🥫', name: 'canned food', keywords: ['can', 'food'] }
        ]
    },
    activity: {
        label: '⚽ Activity',
        emojis: [
            { emoji: '⚽', name: 'soccer ball', keywords: ['soccer', 'football', 'sport'] },
            { emoji: '🏀', name: 'basketball', keywords: ['basketball', 'sport'] },
            { emoji: '🏈', name: 'american football', keywords: ['football', 'american', 'sport'] },
            { emoji: '⚾', name: 'baseball', keywords: ['baseball', 'sport'] },
            { emoji: '🥎', name: 'softball', keywords: ['softball', 'sport'] },
            { emoji: '🎾', name: 'tennis', keywords: ['tennis', 'sport'] },
            { emoji: '🏐', name: 'volleyball', keywords: ['volleyball', 'sport'] },
            { emoji: '🏉', name: 'rugby football', keywords: ['rugby', 'sport'] },
            { emoji: '🥏', name: 'flying disc', keywords: ['frisbee', 'disc'] },
            { emoji: '🎱', name: 'pool 8 ball', keywords: ['pool', 'billiards', '8ball'] },
            { emoji: '🪀', name: 'yo-yo', keywords: ['yoyo', 'toy'] },
            { emoji: '🏓', name: 'ping pong', keywords: ['ping pong', 'table tennis'] },
            { emoji: '🏸', name: 'badminton', keywords: ['badminton', 'sport'] },
            { emoji: '🥅', name: 'goal net', keywords: ['goal', 'net', 'sport'] },
            { emoji: '⛳', name: 'flag in hole', keywords: ['golf', 'flag'] },
            { emoji: '🪁', name: 'kite', keywords: ['kite', 'flying'] },
            { emoji: '🏹', name: 'bow and arrow', keywords: ['archery', 'bow', 'arrow'] },
            { emoji: '🎣', name: 'fishing pole', keywords: ['fishing', 'pole'] },
            { emoji: '🤿', name: 'diving mask', keywords: ['diving', 'mask'] },
            { emoji: '🥊', name: 'boxing glove', keywords: ['boxing', 'glove'] },
            { emoji: '🥋', name: 'martial arts uniform', keywords: ['martial arts', 'karate'] },
            { emoji: '🎽', name: 'running shirt', keywords: ['running', 'shirt'] },
            { emoji: '🛹', name: 'skateboard', keywords: ['skateboard', 'skating'] },
            { emoji: '🛷', name: 'sled', keywords: ['sled', 'sledding'] },
            { emoji: '⛸️', name: 'ice skate', keywords: ['ice skating', 'skate'] },
            { emoji: '🥌', name: 'curling stone', keywords: ['curling', 'stone'] },
            { emoji: '🎿', name: 'skis', keywords: ['skiing', 'ski'] },
            { emoji: '⛷️', name: 'skier', keywords: ['skiing', 'skier'] },
            { emoji: '🏂', name: 'snowboarder', keywords: ['snowboarding', 'snowboard'] },
            { emoji: '🪂', name: 'parachute', keywords: ['parachute', 'skydiving'] },
            { emoji: '🏋️', name: 'person lifting weights', keywords: ['weightlifting', 'gym'] },
            { emoji: '🤼', name: 'people wrestling', keywords: ['wrestling', 'sport'] },
            { emoji: '🤸', name: 'person cartwheeling', keywords: ['cartwheel', 'gymnastics'] },
            { emoji: '⛹️', name: 'person bouncing ball', keywords: ['basketball', 'bouncing'] },
            { emoji: '🤺', name: 'person fencing', keywords: ['fencing', 'sword'] },
            { emoji: '🧘', name: 'person in lotus position', keywords: ['meditation', 'yoga'] },
            { emoji: '🏇', name: 'horse racing', keywords: ['horse racing', 'jockey'] },
            { emoji: '🏄', name: 'person surfing', keywords: ['surfing', 'surf'] },
            { emoji: '🚣', name: 'person rowing boat', keywords: ['rowing', 'boat'] },
            { emoji: '🏊', name: 'person swimming', keywords: ['swimming', 'swim'] },
            { emoji: '🏌️', name: 'person golfing', keywords: ['golf', 'golfing'] },
            { emoji: '🧗', name: 'person climbing', keywords: ['climbing', 'rock climbing'] },
            { emoji: '🚴', name: 'person biking', keywords: ['biking', 'cycling'] },
            { emoji: '🚵', name: 'person mountain biking', keywords: ['mountain biking', 'cycling'] },
            { emoji: '🧑‍🤝‍🧑', name: 'people holding hands', keywords: ['holding hands', 'friendship'] },
            { emoji: '👫', name: 'woman and man holding hands', keywords: ['couple', 'holding hands'] },
            { emoji: '👬', name: 'men holding hands', keywords: ['men', 'holding hands'] },
            { emoji: '👭', name: 'women holding hands', keywords: ['women', 'holding hands'] },
            { emoji: '💃', name: 'woman dancing', keywords: ['dancing', 'dance'] },
            { emoji: '🕺', name: 'man dancing', keywords: ['dancing', 'dance'] },
            { emoji: '🕴️', name: 'person in suit levitating', keywords: ['levitating', 'suit'] },
            { emoji: '👯', name: 'people with bunny ears', keywords: ['bunny ears', 'dancing'] },
            { emoji: '🧖', name: 'mage', keywords: ['wizard', 'magic'] },
            { emoji: '🧚', name: 'fairy', keywords: ['fairy', 'magic'] },
            { emoji: '🧛', name: 'vampire', keywords: ['vampire', 'halloween'] },
            { emoji: '🧜', name: 'merperson', keywords: ['mermaid', 'merman'] },
            { emoji: '🧝', name: 'elf', keywords: ['elf', 'fantasy'] },
            { emoji: '🧞', name: 'genie', keywords: ['genie', 'magic'] },
            { emoji: '🧟', name: 'zombie', keywords: ['zombie', 'halloween'] },
            { emoji: '🦸', name: 'superhero', keywords: ['superhero', 'hero'] },
            { emoji: '🦹', name: 'supervillain', keywords: ['villain', 'evil'] },
            { emoji: '🥷', name: 'ninja', keywords: ['ninja', 'stealth'] },
            { emoji: '👤', name: 'bust in silhouette', keywords: ['silhouette', 'person'] },
            { emoji: '👥', name: 'busts in silhouette', keywords: ['silhouette', 'people'] }
        ]
    },
    objects: {
        label: '💎 Objects',
        emojis: [
            { emoji: '⌚', name: 'watch', keywords: ['watch', 'time'] },
            { emoji: '📱', name: 'mobile phone', keywords: ['phone', 'mobile'] },
            { emoji: '📲', name: 'mobile phone with arrow', keywords: ['phone', 'call'] },
            { emoji: '💻', name: 'laptop computer', keywords: ['laptop', 'computer'] },
            { emoji: '⌨️', name: 'keyboard', keywords: ['keyboard', 'typing'] },
            { emoji: '🖥️', name: 'desktop computer', keywords: ['computer', 'desktop'] },
            { emoji: '🖨️', name: 'printer', keywords: ['printer', 'print'] },
            { emoji: '🖱️', name: 'computer mouse', keywords: ['mouse', 'computer'] },
            { emoji: '🖲️', name: 'trackball', keywords: ['trackball', 'computer'] },
            { emoji: '🕹️', name: 'joystick', keywords: ['joystick', 'gaming'] },
            { emoji: '🗜️', name: 'clamp', keywords: ['clamp', 'tool'] },
            { emoji: '💽', name: 'computer disk', keywords: ['disk', 'computer'] },
            { emoji: '💾', name: 'floppy disk', keywords: ['floppy', 'save'] },
            { emoji: '💿', name: 'optical disk', keywords: ['cd', 'disk'] },
            { emoji: '📀', name: 'dvd', keywords: ['dvd', 'disk'] },
            { emoji: '🧮', name: 'abacus', keywords: ['abacus', 'math'] },
            { emoji: '🎥', name: 'movie camera', keywords: ['camera', 'movie'] },
            { emoji: '🎞️', name: 'film frames', keywords: ['film', 'movie'] },
            { emoji: '📽️', name: 'film projector', keywords: ['projector', 'movie'] },
            { emoji: '🎬', name: 'clapper board', keywords: ['movie', 'film'] },
            { emoji: '📺', name: 'television', keywords: ['tv', 'television'] },
            { emoji: '📷', name: 'camera', keywords: ['camera', 'photo'] },
            { emoji: '📸', name: 'camera with flash', keywords: ['camera', 'flash'] },
            { emoji: '📹', name: 'video camera', keywords: ['video', 'camera'] },
            { emoji: '📼', name: 'videocassette', keywords: ['vhs', 'video'] },
            { emoji: '🔍', name: 'magnifying glass tilted left', keywords: ['search', 'magnify'] },
            { emoji: '🔎', name: 'magnifying glass tilted right', keywords: ['search', 'magnify'] },
            { emoji: '🕯️', name: 'candle', keywords: ['candle', 'light'] },
            { emoji: '💡', name: 'light bulb', keywords: ['bulb', 'idea'] },
            { emoji: '🔦', name: 'flashlight', keywords: ['flashlight', 'torch'] },
            { emoji: '🏮', name: 'red paper lantern', keywords: ['lantern', 'japanese'] },
            { emoji: '🪔', name: 'diya lamp', keywords: ['lamp', 'oil'] },
            { emoji: '📔', name: 'notebook with decorative cover', keywords: ['notebook', 'book'] },
            { emoji: '📕', name: 'closed book', keywords: ['book', 'read'] },
            { emoji: '📖', name: 'open book', keywords: ['book', 'read'] },
            { emoji: '📗', name: 'green book', keywords: ['book', 'green'] },
            { emoji: '📘', name: 'blue book', keywords: ['book', 'blue'] },
            { emoji: '📙', name: 'orange book', keywords: ['book', 'orange'] },
            { emoji: '📚', name: 'books', keywords: ['books', 'library'] },
            { emoji: '📓', name: 'notebook', keywords: ['notebook', 'notes'] },
            { emoji: '📒', name: 'ledger', keywords: ['ledger', 'book'] },
            { emoji: '📃', name: 'page with curl', keywords: ['page', 'document'] },
            { emoji: '📜', name: 'scroll', keywords: ['scroll', 'document'] },
            { emoji: '📄', name: 'page facing up', keywords: ['page', 'document'] },
            { emoji: '📰', name: 'newspaper', keywords: ['newspaper', 'news'] },
            { emoji: '🗞️', name: 'rolled-up newspaper', keywords: ['newspaper', 'rolled'] },
            { emoji: '📑', name: 'bookmark tabs', keywords: ['bookmark', 'tabs'] },
            { emoji: '🔖', name: 'bookmark', keywords: ['bookmark', 'tag'] },
            { emoji: '🏷️', name: 'label', keywords: ['label', 'tag'] },
            { emoji: '💰', name: 'money bag', keywords: ['money', 'bag'] },
            { emoji: '🪙', name: 'coin', keywords: ['coin', 'money'] },
            { emoji: '💴', name: 'yen banknote', keywords: ['yen', 'money'] },
            { emoji: '💵', name: 'dollar banknote', keywords: ['dollar', 'money'] },
            { emoji: '💶', name: 'euro banknote', keywords: ['euro', 'money'] },
            { emoji: '💷', name: 'pound banknote', keywords: ['pound', 'money'] },
            { emoji: '💸', name: 'money with wings', keywords: ['money', 'flying'] },
            { emoji: '💳', name: 'credit card', keywords: ['credit card', 'payment'] },
            { emoji: '🧾', name: 'receipt', keywords: ['receipt', 'bill'] },
            { emoji: '💎', name: 'gem stone', keywords: ['diamond', 'gem'] },
            { emoji: '⚖️', name: 'balance scale', keywords: ['scale', 'justice'] },
            { emoji: '🪜', name: 'ladder', keywords: ['ladder', 'climb'] },
            { emoji: '🧰', name: 'toolbox', keywords: ['toolbox', 'tools'] },
            { emoji: '🔧', name: 'wrench', keywords: ['wrench', 'tool'] },
            { emoji: '🔨', name: 'hammer', keywords: ['hammer', 'tool'] },
            { emoji: '⚒️', name: 'hammer and pick', keywords: ['hammer', 'pick'] },
            { emoji: '🛠️', name: 'hammer and wrench', keywords: ['tools', 'repair'] },
            { emoji: '⛏️', name: 'pick', keywords: ['pick', 'mining'] },
            { emoji: '🪓', name: 'axe', keywords: ['axe', 'chop'] },
            { emoji: '🪚', name: 'carpentry saw', keywords: ['saw', 'carpentry'] },
            { emoji: '🔩', name: 'nut and bolt', keywords: ['nut', 'bolt'] },
            { emoji: '⚙️', name: 'gear', keywords: ['gear', 'settings'] },
            { emoji: '🪤', name: 'mouse trap', keywords: ['trap', 'mouse'] },
            { emoji: '🧲', name: 'magnet', keywords: ['magnet', 'attract'] },
            { emoji: '🪣', name: 'bucket', keywords: ['bucket', 'pail'] },
            { emoji: '🔫', name: 'water pistol', keywords: ['water gun', 'pistol'] },
            { emoji: '🧨', name: 'firecracker', keywords: ['firecracker', 'dynamite'] },
            { emoji: '🪃', name: 'boomerang', keywords: ['boomerang', 'return'] },
            { emoji: '🏹', name: 'bow and arrow', keywords: ['bow', 'arrow'] },
            { emoji: '🛡️', name: 'shield', keywords: ['shield', 'protection'] },
            { emoji: '🪚', name: 'carpentry saw', keywords: ['saw', 'tool'] },
            { emoji: '🔪', name: 'kitchen knife', keywords: ['knife', 'cut'] },
            { emoji: '🗡️', name: 'dagger', keywords: ['dagger', 'sword'] },
            { emoji: '⚔️', name: 'crossed swords', keywords: ['swords', 'battle'] },
            { emoji: '🛒', name: 'shopping cart', keywords: ['shopping', 'cart'] },
            { emoji: '🏺', name: 'amphora', keywords: ['vase', 'pottery'] },
            { emoji: '🔮', name: 'crystal ball', keywords: ['crystal', 'fortune'] },
            { emoji: '🪬', name: 'hamsa', keywords: ['hamsa', 'protection'] },
            { emoji: '📿', name: 'prayer beads', keywords: ['beads', 'prayer'] },
            { emoji: '🧿', name: 'nazar amulet', keywords: ['evil eye', 'protection'] },
            { emoji: '🪩', name: 'mirror ball', keywords: ['disco', 'ball'] },
            { emoji: '🔔', name: 'bell', keywords: ['bell', 'ring'] },
            { emoji: '🔕', name: 'bell with slash', keywords: ['silent', 'mute'] }
        ]
    },
    symbols: {
        label: '❤️ Symbols',
        emojis: [
            { emoji: '❤️', name: 'red heart', keywords: ['love', 'heart', 'red'] },
            { emoji: '🧡', name: 'orange heart', keywords: ['love', 'heart', 'orange'] },
            { emoji: '💛', name: 'yellow heart', keywords: ['love', 'heart', 'yellow'] },
            { emoji: '💚', name: 'green heart', keywords: ['love', 'heart', 'green'] },
            { emoji: '💙', name: 'blue heart', keywords: ['love', 'heart', 'blue'] },
            { emoji: '💜', name: 'purple heart', keywords: ['love', 'heart', 'purple'] },
            { emoji: '🖤', name: 'black heart', keywords: ['love', 'heart', 'black'] },
            { emoji: '🤍', name: 'white heart', keywords: ['love', 'heart', 'white'] },
            { emoji: '🤎', name: 'brown heart', keywords: ['love', 'heart', 'brown'] },
            { emoji: '💔', name: 'broken heart', keywords: ['broken', 'heart', 'sad'] },
            { emoji: '❣️', name: 'heart exclamation', keywords: ['heart', 'exclamation'] },
            { emoji: '💕', name: 'two hearts', keywords: ['hearts', 'love'] },
            { emoji: '💞', name: 'revolving hearts', keywords: ['hearts', 'revolving'] },
            { emoji: '💓', name: 'beating heart', keywords: ['heart', 'beating'] },
            { emoji: '💗', name: 'growing heart', keywords: ['heart', 'growing'] },
            { emoji: '💖', name: 'sparkling heart', keywords: ['heart', 'sparkle'] },
            { emoji: '💘', name: 'heart with arrow', keywords: ['heart', 'arrow', 'cupid'] },
            { emoji: '💝', name: 'heart with ribbon', keywords: ['heart', 'gift'] },
            { emoji: '💟', name: 'heart decoration', keywords: ['heart', 'decoration'] },
            { emoji: '☮️', name: 'peace symbol', keywords: ['peace', 'symbol'] },
            { emoji: '✝️', name: 'latin cross', keywords: ['cross', 'christian'] },
            { emoji: '☪️', name: 'star and crescent', keywords: ['islam', 'muslim'] },
            { emoji: '🕉️', name: 'om', keywords: ['om', 'hindu'] },
            { emoji: '☸️', name: 'wheel of dharma', keywords: ['dharma', 'buddhist'] },
            { emoji: '✡️', name: 'star of david', keywords: ['david', 'jewish'] },
            { emoji: '🔯', name: 'dotted six-pointed star', keywords: ['star', 'six pointed'] },
            { emoji: '🕎', name: 'menorah', keywords: ['menorah', 'jewish'] },
            { emoji: '☯️', name: 'yin yang', keywords: ['yin yang', 'balance'] },
            { emoji: '☦️', name: 'orthodox cross', keywords: ['orthodox', 'cross'] },
            { emoji: '🛐', name: 'place of worship', keywords: ['worship', 'religion'] },
            { emoji: '⛎', name: 'ophiuchus', keywords: ['ophiuchus', 'zodiac'] },
            { emoji: '♈', name: 'aries', keywords: ['aries', 'zodiac'] },
            { emoji: '♉', name: 'taurus', keywords: ['taurus', 'zodiac'] },
            { emoji: '♊', name: 'gemini', keywords: ['gemini', 'zodiac'] },
            { emoji: '♋', name: 'cancer', keywords: ['cancer', 'zodiac'] },
            { emoji: '♌', name: 'leo', keywords: ['leo', 'zodiac'] },
            { emoji: '♍', name: 'virgo', keywords: ['virgo', 'zodiac'] },
            { emoji: '♎', name: 'libra', keywords: ['libra', 'zodiac'] },
            { emoji: '♏', name: 'scorpius', keywords: ['scorpius', 'zodiac'] },
            { emoji: '♐', name: 'sagittarius', keywords: ['sagittarius', 'zodiac'] },
            { emoji: '♑', name: 'capricorn', keywords: ['capricorn', 'zodiac'] },
            { emoji: '♒', name: 'aquarius', keywords: ['aquarius', 'zodiac'] },
            { emoji: '♓', name: 'pisces', keywords: ['pisces', 'zodiac'] },
            { emoji: '🆔', name: 'id button', keywords: ['id', 'identification'] },
            { emoji: '⚛️', name: 'atom symbol', keywords: ['atom', 'science'] },
            { emoji: '🉑', name: 'japanese "acceptable" button', keywords: ['acceptable', 'japanese'] },
            { emoji: '☢️', name: 'radioactive', keywords: ['radioactive', 'danger'] },
            { emoji: '☣️', name: 'biohazard', keywords: ['biohazard', 'danger'] },
            { emoji: '📴', name: 'mobile phone off', keywords: ['phone', 'off'] },
            { emoji: '📳', name: 'vibration mode', keywords: ['vibration', 'phone'] },
            { emoji: '🈶', name: 'japanese "not free of charge" button', keywords: ['not free', 'japanese'] },
            { emoji: '🈚', name: 'japanese "free of charge" button', keywords: ['free', 'japanese'] },
            { emoji: '🈸', name: 'japanese "application" button', keywords: ['application', 'japanese'] },
            { emoji: '🈺', name: 'japanese "open for business" button', keywords: ['open', 'japanese'] },
            { emoji: '🈷️', name: 'japanese "monthly amount" button', keywords: ['monthly', 'japanese'] },
            { emoji: '✴️', name: 'eight-pointed star', keywords: ['star', 'sparkle'] },
            { emoji: '🆚', name: 'vs button', keywords: ['vs', 'versus'] },
            { emoji: '💮', name: 'white flower', keywords: ['flower', 'white'] },
            { emoji: '🉐', name: 'japanese "bargain" button', keywords: ['bargain', 'japanese'] },
            { emoji: '㊙️', name: 'japanese "secret" button', keywords: ['secret', 'japanese'] },
            { emoji: '㊗️', name: 'japanese "congratulations" button', keywords: ['congratulations', 'japanese'] },
            { emoji: '🈴', name: 'japanese "passing grade" button', keywords: ['passing', 'japanese'] },
            { emoji: '🈵', name: 'japanese "no vacancy" button', keywords: ['no vacancy', 'japanese'] },
            { emoji: '🈹', name: 'japanese "discount" button', keywords: ['discount', 'japanese'] },
            { emoji: '🈲', name: 'japanese "prohibited" button', keywords: ['prohibited', 'japanese'] },
            { emoji: '🅰️', name: 'a button (blood type)', keywords: ['a', 'blood type'] },
            { emoji: '🅱️', name: 'b button (blood type)', keywords: ['b', 'blood type'] },
            { emoji: '🆎', name: 'ab button (blood type)', keywords: ['ab', 'blood type'] },
            { emoji: '🅾️', name: 'o button (blood type)', keywords: ['o', 'blood type'] },
            { emoji: '💯', name: 'hundred points', keywords: ['100', 'perfect'] },
            { emoji: '🔠', name: 'input latin uppercase', keywords: ['uppercase', 'abc'] },
            { emoji: '🔡', name: 'input latin lowercase', keywords: ['lowercase', 'abc'] },
            { emoji: '🔢', name: 'input numbers', keywords: ['numbers', '123'] },
            { emoji: '🔣', name: 'input symbols', keywords: ['symbols', 'input'] },
            { emoji: '🔤', name: 'input latin letters', keywords: ['letters', 'abc'] },
            { emoji: '🆕', name: 'new button', keywords: ['new'] },
            { emoji: '🆓', name: 'free button', keywords: ['free'] },
            { emoji: '🆙', name: 'up! button', keywords: ['up'] },
            { emoji: '🆗', name: 'ok button', keywords: ['ok'] },
            { emoji: '🆒', name: 'cool button', keywords: ['cool'] },
            { emoji: '🆖', name: 'ng button', keywords: ['ng', 'no good'] },
            { emoji: 'ℹ️', name: 'information', keywords: ['information', 'info'] },
            { emoji: '🅿️', name: 'p button', keywords: ['parking'] },
            { emoji: '🈁', name: 'japanese "here" button', keywords: ['here', 'japanese'] },
            { emoji: '🈂️', name: 'japanese "service charge" button', keywords: ['service', 'japanese'] },
            { emoji: '🈳', name: 'japanese "vacancy" button', keywords: ['vacancy', 'japanese'] },
            { emoji: '🔘', name: 'radio button', keywords: ['radio', 'button'] },
            { emoji: '🟠', name: 'orange circle', keywords: ['orange', 'circle'] },
            { emoji: '🟡', name: 'yellow circle', keywords: ['yellow', 'circle'] },
            { emoji: '🟢', name: 'green circle', keywords: ['green', 'circle'] },
            { emoji: '🔵', name: 'blue circle', keywords: ['blue', 'circle'] },
            { emoji: '🟣', name: 'purple circle', keywords: ['purple', 'circle'] },
            { emoji: '🟤', name: 'brown circle', keywords: ['brown', 'circle'] },
            { emoji: '⚫', name: 'black circle', keywords: ['black', 'circle'] },
            { emoji: '⚪', name: 'white circle', keywords: ['white', 'circle'] },
            { emoji: '🟥', name: 'red square', keywords: ['red', 'square'] },
            { emoji: '🟧', name: 'orange square', keywords: ['orange', 'square'] },
            { emoji: '🟨', name: 'yellow square', keywords: ['yellow', 'square'] },
            { emoji: '🟩', name: 'green square', keywords: ['green', 'square'] },
            { emoji: '🟦', name: 'blue square', keywords: ['blue', 'square'] },
            { emoji: '🟪', name: 'purple square', keywords: ['purple', 'square'] },
            { emoji: '🟫', name: 'brown square', keywords: ['brown', 'square'] },
            { emoji: '⬛', name: 'black large square', keywords: ['black', 'square'] },
            { emoji: '⬜', name: 'white large square', keywords: ['white', 'square'] },
            { emoji: '◼️', name: 'black medium square', keywords: ['black', 'square'] },
            { emoji: '◻️', name: 'white medium square', keywords: ['white', 'square'] },
            { emoji: '◾', name: 'black medium-small square', keywords: ['black', 'square'] },
            { emoji: '◽', name: 'white medium-small square', keywords: ['white', 'square'] },
            { emoji: '▪️', name: 'black small square', keywords: ['black', 'square'] },
            { emoji: '▫️', name: 'white small square', keywords: ['white', 'square'] },
            { emoji: '🔶', name: 'large orange diamond', keywords: ['orange', 'diamond'] },
            { emoji: '🔷', name: 'large blue diamond', keywords: ['blue', 'diamond'] },
            { emoji: '🔸', name: 'small orange diamond', keywords: ['orange', 'diamond'] },
            { emoji: '🔹', name: 'small blue diamond', keywords: ['blue', 'diamond'] },
            { emoji: '🔺', name: 'red triangle pointed up', keywords: ['red', 'triangle'] },
            { emoji: '🔻', name: 'red triangle pointed down', keywords: ['red', 'triangle'] },
            { emoji: '💠', name: 'diamond with a dot', keywords: ['diamond', 'dot'] },
            { emoji: '🔘', name: 'radio button', keywords: ['radio', 'button'] },
            { emoji: '🔳', name: 'white square button', keywords: ['white', 'square'] },
            { emoji: '🔲', name: 'black square button', keywords: ['black', 'square'] }
        ]
    }
}

const EmojiPicker = ({ onEmojiSelect, onClose, className = '' }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('people')

    // Filter emojis based on search query
    const filteredEmojis = useMemo(() => {
        if (!searchQuery.trim()) {
            return EMOJI_CATEGORIES[activeCategory]?.emojis || []
        }

        const query = searchQuery.toLowerCase()
        const allEmojis = Object.values(EMOJI_CATEGORIES).flatMap(category => category.emojis)

        return allEmojis.filter(emoji =>
            emoji.name.toLowerCase().includes(query) ||
            emoji.keywords.some(keyword => keyword.toLowerCase().includes(query))
        )
    }, [searchQuery, activeCategory])

    const handleEmojiClick = (emoji) => {
        onEmojiSelect?.(emoji.emoji)
        onClose?.()
    }

    return (
        <div className={`w-80 h-96 bg-background border border-border rounded-lg shadow-lg ${className}`}>
            {/* Search */}
            <div className="p-3 border-b border-border">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search emojis..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Categories and Content */}
            {!searchQuery.trim() ? (
                <div className="flex-1">
                    {/* Category Navigation */}
                    <div className="grid grid-cols-6 gap-1 p-2 border-b border-border">
                        {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
                            <Button
                                key={key}
                                variant={activeCategory === key ? "default" : "ghost"}
                                size="sm"
                                className="h-8 w-full text-xs p-1"
                                onClick={() => setActiveCategory(key)}
                                title={category.label}
                            >
                                {category.emojis[0]?.emoji}
                            </Button>
                        ))}
                    </div>

                    {/* Emoji Grid */}
                    <ScrollArea className="h-72 p-2">
                        <div className="grid grid-cols-8 gap-1">
                            {EMOJI_CATEGORIES[activeCategory]?.emojis.map((emoji, index) => (
                                <Button
                                    key={`${activeCategory}-${index}`}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-lg hover:bg-accent rounded transition-colors"
                                    onClick={() => handleEmojiClick(emoji)}
                                    title={emoji.name}
                                >
                                    {emoji.emoji}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            ) : (
                /* Search Results */
                <ScrollArea className="h-80 p-2">
                    {filteredEmojis.length > 0 ? (
                        <div className="grid grid-cols-8 gap-1">
                            {filteredEmojis.map((emoji, index) => (
                                <Button
                                    key={`search-${index}`}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-lg hover:bg-accent rounded transition-colors"
                                    onClick={() => handleEmojiClick(emoji)}
                                    title={emoji.name}
                                >
                                    {emoji.emoji}
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-32 text-muted-foreground">
                            No emojis found for "{searchQuery}"
                        </div>
                    )}
                </ScrollArea>
            )}
        </div>
    )
}

export default EmojiPicker
