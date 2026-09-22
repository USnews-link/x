// SCRIPT ANTI-FBCLID: Membersihkan link secara instan agar Script Iklan muncul
if (window.location.search.includes('fbclid=')) {
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('fbclid');
    window.history.replaceState(null, '', cleanUrl.toString());
}

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const keywordFromQuery = params.get('q') || '';
    
    // Clean URL parameter
    const cleanQuery = keywordFromQuery.replace(/-\d+$/, '');
    
    if (!cleanQuery) {
        runAGC('Trending News');
        return;
    }

    const targetHtml = cleanQuery + '.html';

    // Fetch override: Cek apakah file statis (buatan generator) ada
    fetch(targetHtml)
        .then(response => {
            if (response.ok) { return response.text(); }
            throw new Error('File not found');
        })
        .then(htmlData => {
            document.open();
            document.write(htmlData);
            document.close();
        })
        .catch(error => {
            // Jika file statis tidak ada (404), Jalankan AGC Engine
            const keyword = cleanQuery.replace(/-/g, ' ').trim();
            runAGC(keyword);
        });

    // ========================================================
    // FUNGSI UTAMA AGC (Auto Generated Content) DENGAN API
    // ========================================================
    function runAGC(keyword) {
        const detailTitle = document.getElementById('detail-title');
        const detailBody = document.getElementById('detail-body');
        const detailImage = document.querySelector('.detail-image img');
        const detailImageLink = document.querySelector('.detail-image a');
        const relatedPostsContainer = document.getElementById('related-posts-container');
        
        // Tampilkan status loading sementara
        if (detailTitle) detailTitle.innerText = "Mencari berita terbaru untuk: " + keyword + "...";
        
        // ========================================================
        // 1. SETUP API GNEWS (Ubah API KEY di bawah ini)
        // ========================================================
        const API_KEY = '27939599ce1878b93bcd203d6fc0eefe'; 
        const apiUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(keyword)}&lang=en&country=us&max=5&apikey=${API_KEY}`;

        // Mencoba mengambil data dari API
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.articles && data.articles.length > 0) {
                    // JIKA API BERHASIL: Render berita asli
                    const article = data.articles[0]; // Ambil berita paling relevan (urutan pertama)
                    
                    if (detailTitle) detailTitle.innerText = article.title;
                    
                    if (detailImage && article.image) {
                        detailImage.src = article.image;
                        detailImage.alt = article.title;
                        if(detailImageLink) detailImageLink.href = article.image;
                    }

                    if (detailBody) {
                        // Rangkai output HTML dari data API
                        let contentHtml = `<p style="color:#666; font-size:0.9rem;"><em>Sumber: ${article.source.name} | ${new Date(article.publishedAt).toLocaleDateString()}</em></p>`;
                        contentHtml += `<p style="font-weight:bold; font-size:1.1rem;">${article.description}</p>`;
                        contentHtml += `<p>${article.content}</p>`;
                        contentHtml += `<p><a href="${article.url}" target="_blank" rel="nofollow" style="color:#d32f2f; font-weight:bold;">Baca artikel selengkapnya di sini &raquo;</a></p>`;
                        detailBody.innerHTML = contentHtml;
                    }
                } else {
                    // JIKA KEYWORD TIDAK DITEMUKAN DI API: Gunakan Fallback
                    fallbackAGC(keyword);
                }
            })
            .catch(error => {
                console.error("API Fetch Error atau Limit Habis:", error);
                // JIKA API ERROR (Limit Habis/CORS): Langsung gunakan Fallback agar web tidak rusak
                fallbackAGC(keyword);
            });

        // ========================================================
        // 2. SISTEM FALLBACK (Bing Image + Spin Text Default)
        // ========================================================
        function fallbackAGC(kw) {
            const titleCap = kw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            if (detailTitle) detailTitle.innerText = titleCap + " - Latest Breaking News & Updates";
            
            const queryImage = kw + " breaking news";
            const imgUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=800&h=500&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
            
            if (detailImage) {
                detailImage.src = imgUrl;
                detailImage.alt = titleCap;
                if(detailImageLink) detailImageLink.href = imgUrl;
            }

            if (detailBody) {
                detailBody.innerHTML = `<p>Welcome to the latest updates regarding <strong>${titleCap}</strong>. As events unfold, our team is dedicated to bringing you the most accurate and timely information available.</p>
                <p>In today's fast-paced world, staying informed about <em>${kw}</em> is more crucial than ever. Whether it impacts local communities or has global implications, understanding the nuances of this story helps us navigate the broader context of current events.</p>
                <p>Experts are currently analyzing the situation, and various perspectives are emerging. While some view this as a sudden development, others have anticipated these changes based on recent trends. We will continue to monitor the situation closely and provide comprehensive coverage as new details come to light. Please stay tuned for further in-depth analysis and expert opinions.</p>`;
            }
        }

        // ========================================================
        // 3. GENERATE RELATED POSTS (Trending Now)
        // ========================================================
        function generateRelatedPosts(kw) {
            const hookWords = ['Breaking:', 'Trending:', 'Watch:', 'Exclusive:', 'Viral:'];
            const suffixWords = ['Revealed', 'Explained', 'Live Update', 'News'];
            
            function generateSeoTitle(term) {
                const rHook = hookWords[Math.floor(Math.random() * hookWords.length)];
                const rSuffix = suffixWords[Math.floor(Math.random() * suffixWords.length)];
                const termCap = term.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                return `${rHook} ${termCap} ${rSuffix}`;
            }

            fetch('keyword.txt')
                .then(res => res.text())
                .then(data => {
                    let keywords = data.split('\n').map(k => k.trim()).filter(k => k.length > 0);
                    let displayedKeywords = new Set();
                    let relatedCount = 0;
                    
                    if(relatedPostsContainer) relatedPostsContainer.innerHTML = ''; 
                    
                    // Acak urutan array keyword
                    for (let i = keywords.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [keywords[i], keywords[j]] = [keywords[j], keywords[i]];
                    }

                    keywords.forEach(term => {
                        if (relatedCount >= 6) return;
                        const termLower = term.toLowerCase();
                        
                        // Jangan tampilkan keyword yang sama dengan halaman saat ini
                        if (termLower === kw.toLowerCase() || displayedKeywords.has(termLower)) return;
                        
                        displayedKeywords.add(termLower);
                        relatedCount++;
                        
                        const keywordForUrl = term.replace(/\s/g, '-').toLowerCase();
                        const linkUrl = `index.html?q=${encodeURIComponent(keywordForUrl)}`;
                        
                        const queryImage = term + " breaking news";
                        const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=400&h=250&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
                        const newRelatedTitle = generateSeoTitle(term);
                        
                        const card = `
                        <article class="content-card">
                            <a href="${linkUrl}">
                                <img src="${imageUrl}" alt="${newRelatedTitle}" loading="lazy">
                                <div class="content-card-body">
                                    <h3>${newRelatedTitle}</h3>
                                </div>
                            </a>
                        </article>`;
                        
                        if(relatedPostsContainer) relatedPostsContainer.innerHTML += card;
                    });
                })
                .catch(err => console.log('Gagal memuat keyword.txt untuk Related Posts'));
        }
        
        generateRelatedPosts(keyword);
    }
});
