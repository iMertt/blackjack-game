// Card deck and game variables
let deck = [];
let playerCards = [];
let dealerCards = [];
let playerScore = 0;
let dealerScore = 0;
let gameInProgress = false;
let playerBalance = 1000;
let currentBet = 0;

// DOM elements
const dealBtn = document.getElementById('deal-btn');
const hitBtn = document.getElementById('hit-btn');
const standBtn = document.getElementById('stand-btn');
const playerCardsEl = document.getElementById('player-cards');
const dealerCardsEl = document.getElementById('dealer-cards');
const playerScoreEl = document.getElementById('player-score');
const dealerScoreEl = document.getElementById('dealer-score');
const messageEl = document.getElementById('message');
const balanceEl = document.getElementById('balance');
const betAmountEl = document.getElementById('bet-amount');
const chipEls = document.querySelectorAll('.chip');
const resetBetBtn = document.getElementById('reset-bet-btn');

// Event listeners
dealBtn.addEventListener('click', startGame);
hitBtn.addEventListener('click', playerHit);
standBtn.addEventListener('click', playerStand);
resetBetBtn.addEventListener('click', resetBet);

// Reset bet function
function resetBet() {
    betAmountEl.value = 0;
    
    // Animation effect
    resetBetBtn.classList.add('active');
    setTimeout(() => {
        resetBetBtn.classList.remove('active');
    }, 200);
}

// Chip click events
chipEls.forEach(chip => {
    chip.addEventListener('click', () => {
        const value = parseInt(chip.dataset.value);
        const currentValue = parseInt(betAmountEl.value) || 0;
        
        // Add chip value to current bet
        betAmountEl.value = currentValue + value;
        
        // Chip animation
        chip.style.transform = 'scale(1.2)';
        setTimeout(() => {
            chip.style.transform = '';
        }, 200);
    });
});

// Create card deck
function createDeck() {
    const suits = ['♥', '♦', '♠', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    deck = [];
    
    for (let suit of suits) {
        for (let value of values) {
            let numValue = 0;
            
            if (value === 'A') {
                numValue = 11;
            } else if (['J', 'Q', 'K'].includes(value)) {
                numValue = 10;
            } else {
                numValue = parseInt(value);
            }
            
            deck.push({
                suit,
                value,
                numValue,
                isRed: suit === '♥' || suit === '♦'
            });
        }
    }
    
    // Shuffle the deck
    shuffleDeck();
}

// Shuffle the deck
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Start the game
function startGame() {
    // Bet check
    const betAmount = parseInt(betAmountEl.value);
    
    if (isNaN(betAmount) || betAmount < 10) {
        showMessage('Please enter a valid bet amount (minimum 10)');
        return;
    }
    
    if (betAmount > playerBalance) {
        showMessage('You don\'t have enough balance for this bet!');
        return;
    }
    
    // Set bet and deduct from balance
    currentBet = betAmount;
    playerBalance -= currentBet;
    balanceEl.textContent = playerBalance;
    
    // Start the game
    gameInProgress = true;
    messageEl.textContent = '';
    messageEl.classList.remove('show');
    
    // Create new deck
    createDeck();
    
    // Clear cards
    playerCards = [];
    dealerCards = [];
    playerCardsEl.innerHTML = '';
    dealerCardsEl.innerHTML = '';
    
    // Enable buttons
    dealBtn.disabled = true;
    hitBtn.disabled = true;
    standBtn.disabled = true;
    betAmountEl.disabled = true;
    
    // Deal cards in sequence (with animation)
    setTimeout(() => {
        dealCardWithAnimation(playerCards, playerCardsEl, false);
        
        setTimeout(() => {
            dealCardWithAnimation(dealerCards, dealerCardsEl, false);
            
            setTimeout(() => {
                dealCardWithAnimation(playerCards, playerCardsEl, false);
                
                setTimeout(() => {
                    dealCardWithAnimation(dealerCards, dealerCardsEl, true);
                    
                    // Update scores
                    updateScores();
                    
                    // Enable buttons
                    hitBtn.disabled = false;
                    standBtn.disabled = false;
                    
                    // Check for blackjack
                    checkForBlackjack();
                }, 300);
            }, 300);
        }, 300);
    }, 500);
}

// Deal card with animation
function dealCardWithAnimation(cardsArray, containerEl, isHidden) {
    const card = deck.pop();
    cardsArray.push(card);
    
    const cardEl = isHidden ? createHiddenCardElement() : createCardElement(card);
    cardEl.classList.add('card-dealing');
    containerEl.appendChild(cardEl);
    
    // Card dealing animation
    setTimeout(() => {
        cardEl.classList.remove('card-dealing');
    }, 500);
}

// Render cards on screen
function renderCards() {
    playerCardsEl.innerHTML = '';
    dealerCardsEl.innerHTML = '';
    
    // Player cards
    playerCards.forEach(card => {
        const cardEl = createCardElement(card);
        playerCardsEl.appendChild(cardEl);
    });
    
    // Dealer cards (first card hidden)
    dealerCards.forEach((card, index) => {
        if (index === 1 && gameInProgress) {
            const hiddenCard = createHiddenCardElement();
            dealerCardsEl.appendChild(hiddenCard);
        } else {
            const cardEl = createCardElement(card);
            dealerCardsEl.appendChild(cardEl);
        }
    });
}

// Create hidden card element
function createHiddenCardElement() {
    const cardEl = document.createElement('div');
    cardEl.className = 'card hidden';
    return cardEl;
}

// Create card element
function createCardElement(card) {
    const cardEl = document.createElement('div');
    cardEl.className = `card ${card.isRed ? 'red' : ''}`;
    
    const topSuit = document.createElement('div');
    topSuit.className = 'suit top-suit';
    topSuit.textContent = card.suit;
    
    const value = document.createElement('div');
    value.className = 'value';
    value.textContent = card.value;
    
    const bottomSuit = document.createElement('div');
    bottomSuit.className = 'suit bottom-suit';
    bottomSuit.textContent = card.suit;
    
    cardEl.appendChild(topSuit);
    cardEl.appendChild(value);
    cardEl.appendChild(bottomSuit);
    
    return cardEl;
}

// Update scores
function updateScores() {
    playerScore = calculateScore(playerCards);
    
    // Dealer score (if game in progress, only show first card value)
    if (gameInProgress) {
        dealerScore = dealerCards[0].numValue;
        dealerScoreEl.textContent = `Total: ${dealerScore}`;
    } else {
        dealerScore = calculateScore(dealerCards);
        dealerScoreEl.textContent = `Total: ${dealerScore}`;
    }
    
    playerScoreEl.textContent = `Total: ${playerScore}`;
}

// Calculate score (special case for Ace)
function calculateScore(cards) {
    let score = 0;
    let aces = 0;
    
    for (let card of cards) {
        score += card.numValue;
        if (card.value === 'A') {
            aces++;
        }
    }
    
    // Reduce Ace value from 11 to 1 if needed
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    
    return score;
}

// Check for blackjack
function checkForBlackjack() {
    if (playerScore === 21) {
        if (calculateScore(dealerCards) === 21) {
            showMessage('Tie! Both have Blackjack.');
            playerBalance += currentBet; // Return bet
        } else {
            showMessage('Blackjack! You win!', true);
            playerBalance += currentBet * 2.5; // Blackjack pays 3:2
        }
        balanceEl.textContent = playerBalance;
        endGame();
    }
}

// Player hits
function playerHit() {
    playerCards.push(deck.pop());
    renderCards();
    updateScores();
    
    if (playerScore > 21) {
        endGame('Bust! You lose.');
    }
}

// Player stands
function playerStand() {
    gameInProgress = false;
    
    // Flip dealer's hidden card
    flipDealerCard();
    
    setTimeout(() => {
        // Dealer draws until 17 or higher
        dealerPlay();
    }, 1000);
}

// Flip dealer's hidden card
function flipDealerCard() {
    const hiddenCardEl = dealerCardsEl.querySelector('.card.hidden');
    if (hiddenCardEl) {
        hiddenCardEl.classList.add('card-flipping');
        
        setTimeout(() => {
            const newCardEl = createCardElement(dealerCards[1]);
            dealerCardsEl.replaceChild(newCardEl, hiddenCardEl);
            updateScores();
        }, 250);
    }
}

// Dealer play
function dealerPlay() {
    updateScores();
    
    if (dealerScore < 17) {
        setTimeout(() => {
            dealCardWithAnimation(dealerCards, dealerCardsEl, false);
            
            setTimeout(() => {
                dealerPlay();
            }, 700);
        }, 700);
    } else {
        // Determine winner
        setTimeout(() => {
            determineWinner();
        }, 500);
    }
}

// Determine winner
function determineWinner() {
    if (dealerScore > 21) {
        showMessage('Dealer busts! You win!', true);
        playerBalance += currentBet * 2;
    } else if (dealerScore > playerScore) {
        showMessage('Dealer wins!', false);
    } else if (dealerScore < playerScore) {
        showMessage('Congratulations! You win!', true);
        playerBalance += currentBet * 2;
    } else {
        showMessage('It\'s a tie!');
        playerBalance += currentBet;
    }
    
    balanceEl.textContent = playerBalance;
    endGame();
}

// Show message
function showMessage(message, isWin = null) {
    messageEl.textContent = message;
    messageEl.classList.add('show');
}

// End game
function endGame() {
    gameInProgress = false;
    
    // Update buttons
    hitBtn.disabled = true;
    standBtn.disabled = true;
    dealBtn.disabled = false;
    betAmountEl.disabled = false;
}

// Show balance at game start
balanceEl.textContent = playerBalance;