const quotes = [
    "오늘 하루도 최선을 다하세요.",
    "매일 조금씩 나아지세요.",
    "성공은 노력하는 자에게 온다.",
    "작은 변화가 큰 차이를 만든다.",
    "오늘이 가장 중요한 날이다.",
    "목표를 향해 꾸준히 나아가세요.",
    "긍정적인 마음을 유지하세요.",
    "자신을 믿고 나아가세요.",
    "어제보다 나은 오늘을 만들자.",
    "열정이 성공을 만든다.",
    "좋은 생각을 갖고 살아가세요.",
    "힘든 시간도 지나갈 것이다.",
    "실패는 성공의 어머니이다.",
    "모든 것은 시작이 중요하다.",
    "오늘의 작은 성취를 기뻐하자.",
    "실패를 두려워하지 마세요.",
    "작은 목표라도 달성할 때마다 기쁨을 느끼세요.",
    "변화는 항상 어렵지만, 결국 성공을 만든다.",
    "노력한 만큼 결과가 따른다.",
    "꾸준함이 가장 큰 경쟁력이다."
];

document.addEventListener("DOMContentLoaded", function() {
    // Get today's date (you can use any part of the date: day, month, etc.)
    const today = new Date();
    const dayOfYear = today.getDate();  // You can use `getDate()` for day of the month or `getDay()` for the weekday.

    // Calculate an index based on the current day of the year
    const index = dayOfYear % quotes.length;

    // Get the quote
    const quote = quotes[index];

    // Set the quote in the "오늘의 명언" text
    const quoteElement = document.getElementById("topParagraph");
    quoteElement.textContent = quote;
});
