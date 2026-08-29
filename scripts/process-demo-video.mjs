import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { copyFile, mkdir, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const require = createRequire(import.meta.url)
const ffmpegPath = require('ffmpeg-static')
const { path: ffprobePath } = require('ffprobe-static')
const workspace = process.cwd()
const resultsDir = path.join(workspace, 'test-results')
const outputDir = path.join(workspace, 'artifacts')
const outputVideo = path.join(outputDir, 'commerce-os-interview-demo.mp4')
const outputPoster = path.join(outputDir, 'commerce-os-interview-demo-poster.jpg')
const outputMetadata = path.join(outputDir, 'commerce-os-interview-demo.json')
const publicMediaDir = path.join(workspace, 'public', 'media')

async function newestVideo(directory) {
  const candidates = []
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name)
      if (entry.isDirectory()) await walk(target)
      else if (/\.(webm|mp4)$/i.test(entry.name)) {
        const info = await stat(target)
        candidates.push({ target, modifiedAt: info.mtimeMs })
      }
    }
  }
  await walk(directory)
  candidates.sort((a, b) => b.modifiedAt - a.modifiedAt)
  return candidates[0]?.target
}

function run(binary, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', chunk => { stdout += chunk })
    child.stderr.on('data', chunk => { stderr += chunk })
    child.on('error', reject)
    child.on('close', code => {
      if (code === 0) resolve({ stdout, stderr })
      else reject(new Error(stderr || `Command failed with exit code ${code}`))
    })
  })
}

await mkdir(outputDir, { recursive: true })
const inputVideo = await newestVideo(resultsDir)
if (!inputVideo) throw new Error('No Playwright recording was found in test-results.')
if (!ffmpegPath || !ffprobePath) throw new Error('ffmpeg-static or ffprobe-static is unavailable.')

const videoFilter = [
  'scale=1920:1080:force_original_aspect_ratio=decrease',
  'pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=#101b15',
  'fps=30',
].join(',')

await run(ffmpegPath, [
  '-y',
  '-i', inputVideo,
  '-vf', videoFilter,
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-crf', '21',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  '-an',
  outputVideo,
])

await run(ffmpegPath, [
  '-y',
  '-ss', '00:00:04',
  '-i', outputVideo,
  '-frames:v', '1',
  '-q:v', '2',
  outputPoster,
])

const probe = await run(ffprobePath, [
  '-v', 'error',
  '-show_entries', 'format=duration,size:stream=codec_name,width,height,avg_frame_rate',
  '-of', 'json',
  outputVideo,
])
const metadata = JSON.parse(probe.stdout)
const duration = Number(metadata.format?.duration ?? 0)
const stream = metadata.streams?.[0] ?? {}
if (duration < 30 || duration > 60) {
  throw new Error(`Demo duration must be 30-60 seconds; received ${duration.toFixed(2)} seconds.`)
}
if (stream.width !== 1920 || stream.height !== 1080 || stream.codec_name !== 'h264') {
  throw new Error('Demo output must be a 1920x1080 H.264 video.')
}

const summary = {
  source: path.relative(workspace, inputVideo),
  video: path.relative(workspace, outputVideo),
  poster: path.relative(workspace, outputPoster),
  durationSeconds: Number(duration.toFixed(2)),
  codec: stream.codec_name,
  resolution: `${stream.width}x${stream.height}`,
  frameRate: stream.avg_frame_rate,
  sizeBytes: Number(metadata.format?.size ?? 0),
  generatedAt: new Date().toISOString(),
}
await writeFile(outputMetadata, `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
await mkdir(publicMediaDir, { recursive: true })
await copyFile(outputVideo, path.join(publicMediaDir, path.basename(outputVideo)))
await copyFile(outputPoster, path.join(publicMediaDir, path.basename(outputPoster)))
await copyFile(outputMetadata, path.join(publicMediaDir, path.basename(outputMetadata)))
console.log(JSON.stringify(summary, null, 2))
