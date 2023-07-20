const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const cd = $('.cd');
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const preBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')



const app = {
    currentIndex : 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Waiting for you',
            singer: 'Mono',
            path: './assets/music/waitingforyou.mp3',
            image: './assets/img/waitingforyou.jfif',
        },
        {
            name: 'Yêu Không Nghỉ Phép',
            singer: 'Isaac',
            path: './assets/music/yeukhongnghiphep.mp3',
            image: './assets/img/yeukhongnghiphep.jfif',
        },
        {
            name: 'Vệ tinh',
            singer: 'HIEUTHUHAI',
            path: './assets/music/vetinh.mp3',
            image: './assets/img/vetinh.jfif',
        },
        {
            name: 'Yêu 5',
            singer: 'Rhymastic',
            path: './assets/music/yeu5.mp3',
            image: './assets/img/yeu5.jfif',
        },
        {
            name: 'Anh sẽ đón em',
            singer: 'Nguyên,Trang',
            path: './assets/music/anhsedonem.mp3',
            image: './assets/img/anhsedonem.jfif',
        },
        {
            name: 'Mãi mãi bên nhau',
            singer: 'Noo Phước Thịnh',
            path: './assets/music/maimaibennhau.mp3',
            image: './assets/img/maimaibennhau.jfif',
        },
        {
            name: 'Vì mẹ anh bắt chia tay',
            singer: 'Miu Lê, Karik',
            path: './assets/music/vimeanhbatchiatay.mp3',
            image: './assets/img/vimeanhbatchiatay.jfif',
        },
        {
            name: 'Bật nhạc lên',
            singer: 'HIEUTHUHAI',
            path: './assets/music/batnhaclen.mp3',
            image: './assets/img/batnhaclen.jfif',
        },
        {
            name: 'Phải là yêu',
            singer: 'HIEUTHUHAI',
            path: './assets/music/phailayeu.mp3',
            image: './assets/img/phailayeu.jfif',
        },
        {
            name: 'Xin đừng nhấc máy',
            singer: 'Bray, Han Sara',
            path: './assets/music/xindungnhacmay.mp3',
            image: './assets/img/xindungnhacmay.jfif',
        },
    ],
    setConfig: function(key,value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config))
    },
    render: function(){
        const htmls = this.songs.map((song,index)=>{
            return `<div class="song ${index === this.currentIndex?'active':''}" data-index=${index}>
                        <div class="thumb" 
                            style="background-image: url('${song.image}')">
                        </div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.singer}</p>
                        </div>
                        <div class="option">
                            <i class="fas fa-ellipsis-h"></i>
                        </div>
                    </div>`
        })
        
        $('.playlist').innerHTML = htmls.join('');
    },
    defineProperties: function(){
        Object.defineProperty(this,'currentSong',{
            get: function(){
                return this.songs[this.currentIndex];  
            }
        })
    },
    handleEvents: function(){
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Xử lý đĩa quay
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration: 10000, //10 giây
            iterations: Infinity
        }) 
        cdThumbAnimate.pause()
        // Xử lý phóng to thu nhỏ  CD
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            // Nếu tỉ lệ lớn hơn 0 thì làm bth nếu tỉ lệ bé hơn 0 thì cho tỉ lệ mới bằng 0
            // Sử dụng trong trường hợp người dùng kéo danh sách bài hát nhanh sinh ra lỗi tỉ lệ
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' :0;
            cd.style.opacity = newCdWidth/cdWidth;
        }

        // Xử lý khi click play
        playBtn.onclick = function(){
            if(_this.isPlaying){
                audio.pause();
            }else{
                audio.play();
            }
        }

        // Khi song được play 
        audio.onplay = function(){
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play()
        }
        // Khi song bị pause 
        audio.onpause = function(){
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause()
        }

        // Xử lý khi tua bài hát
        progress.oninput = function(e){
            const seekTime = audio.duration/100 * e.target.value
            audio.currentTime = seekTime
        }
 
        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime/audio.duration*100)
                progress.value = progressPercent
                console.log(progressPercent)
            }
        }

        // Khi next song
        nextBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong()
            }else{
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi pre song
        preBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong()
            }else{
                _this.preSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()

        }

        // Xử lý bật tắt random song
        randomBtn.onclick = function(e){
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom',_this.isRandom)
            randomBtn.classList.toggle('active',_this.isRandom)
        }

        // Xử lý bật tắt repeat song
        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat',_this.isRepeat)
            repeatBtn.classList.toggle('active',_this.isRepeat)
        }

        // Xử lý next song khi audio ended
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play()
            }else{
                nextBtn.click()
            }
        }

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode|| e.target.closest('.option')){
                // Xử lý khi click vào song
                if(songNode){
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
                // Xử lý khi click vào option
                if(e.target.closest('.option')){}
            }
        }
    },
    scrollToActiveSong: function(){
        setTimeout(()=>{
            if(this.currentIndex > 2){
                $('.song.active').scrollIntoView({
                    behavior: 'smooth', 
                    block: 'nearest',
                })
            }else{
                $('.song.active').scrollIntoView({
                    behavior: 'smooth', 
                    block: 'center',
                })
            }
        },300)
    },
    loadCurrentSong: function(){
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
        
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function(){
        this.currentIndex++
        // Khi tua hết danh sách thì quay lại bài đầu tiên
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0
        }

        this.loadCurrentSong()
    },
    preSong: function(){
        this.currentIndex--
        // Khi tua hết danh sách thì quay lại bài đầu tiên
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1
        }

        this.loadCurrentSong()
    },
    playRandomSong: function(){
        let newIndex
        do{
            newIndex = Math.floor(Math.random() * app.songs.length)
        }while(newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    start: function(){
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig()
        
        // Định nghĩa các thuộc tính cho object
        this.defineProperties()

        // Lắng nghe và xử lý các sự kiện
        this.handleEvents()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        // Render playlist
        this.render()

        // Hiển thị trạng thái ban đầu của nút repeat và random
        randomBtn.classList.toggle('active',this.isRandom)
        repeatBtn.classList.toggle('active',this.isRepeat)
    }
}
// Để làm việc với video như chạy, dừng, tua lên gg sợt HTML Audio and Video DOM Reference 
// khi mở lên ctr sẽ tự chạy
app.start();