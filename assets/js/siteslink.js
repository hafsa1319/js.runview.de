
const datas = [
    {
        id: "serpalarm.com",
        list: ["DesignBlaze","Flexiphil","Developer Service"]
    },
    {
        id: "onsbazaar.com",
        list: ["DesignBlaze","Flexiphil","Developer Service"]
    }
];


datas.map(x => {
    if(x.id === window.location.host) {
        setInterval(function () {
            x.list.map(x => {
                $(".sv-tile__title").each(function (titleIndex,titleContent) {
                    if($(this).text().includes(x)) {
                        $(this).parent().parent().parent().parent().remove()
                    }
                })
            })
        },500)
    }
})