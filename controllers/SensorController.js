const index = ((req, res) => {
    res.render('surah', { 
        title: 'Surah',
        layout: './layouts/full-width',
        surahs: surahs,
    });
})

module.exports = {
    index,
}