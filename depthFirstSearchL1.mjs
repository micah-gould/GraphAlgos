// <![CDATA[
import {
  addExercise,
  Digraph,
  Frame,
  Seq /* and others as needed */
} from '../codecheck-tracer/script/codecheck_tracer.js' // Update to correct filepath
addExercise(function * (sim, state) {
  // TODO Eliminate
  if (state === undefined) {
    state = { seed: sim.randSeed() }
  } else {
    sim.randSeed(state.seed)
  }
  // Add vertices
  const g = new Digraph()
  const n = 8
  for (let i = 0; i < n; i++) g.vertex()
  g.verts().forEach((v) => {
    v.d = ''
    v.f = ''
    v.π = ''
  })

  // Add edges
  let target = 15
  while (target > 0) {
    const [a, b] = sim.randDistinctInts(2, 0, n - 1)
    const v = g.verts()[a]
    const w = g.verts()[b]
    if (g.findEdge(v, w) === undefined && g.findEdge(w, v) === undefined) {
      g.edge(v, w)
      target--
    }
  }

  const vars = sim.add(0, 0, new Frame())
  vars.sorted = new Seq()
  const sorts = []
  g.layout(sim, 1, 0.5, 15, 15)

  let time = 0
  yield sim.start(state)
  yield * visit(g.verts()[0])

  for (const u of g.verts()) {
    if (u.color === 'lightsteelblue') {
      yield sim.ask(
        u,
        'Select the next vertex.',
        'If there is more than one correct choice, choose the first one in alphabetical order'
      )
      yield * visit(u, u)
    }
  }

  function * visit (vert, from) {
    time++
    vert.d = time
    vert.color = 'aquamarine'
    const adjVerts = g.adjacent(vert)
    for (const v of adjVerts) {
      if (v.color === 'lightsteelblue') {
        yield sim.ask(
          v,
          'Select the next vertex.',
          'If there is more than one correct choice, choose the first one in alphabetical order'
        )
        v.π = vert.toString()
        yield * visit(v, from)
      }
    }
    vert.color = 'lightpink'
    time++
    vert.f = time
    sorts.unshift(vert.toString())
    for (let i = 0; i < sorts.length; i++) {
      vars.sorted[i] = sorts[i]
    }
  }
})
// ]]>
