import express from 'express'
const app = express()
const port = 3000

app.use((_, res, next) => {
    res.set({
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cache-Control': 'no-store'
    });
    next();
});

app.use(express.static('dist/public'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})