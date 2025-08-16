import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from '@xyflow/react';
import dagre from 'dagre';
import { AnimatePresence, motion } from 'framer-motion';
import '@xyflow/react/dist/style.css';
import { useNavigate, useParams } from 'react-router-dom';
import useCourseStore from '../../store/courseStore';

// Custom Node Component for React Flow
const TopicNode = ({ data, selected }) => {
  // Color nodes based on selection and type
  const bgColor = selected
    ? 'bg-indigo-300 border-indigo-600'
    : 'bg-gradient-to-br from-yellow-200 via-pink-100 to-blue-100 border-blue-300';
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border-2 shadow-md px-3 py-2 min-w-[120px] max-w-[200px] ${bgColor}`}
      style={{ transition: 'box-shadow 0.2s, border 0.2s' }}
    >
      {/* Input handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ background: '#555' }}
      />
      
      <div className="font-bold text-base md:text-lg text-gray-900 mb-1 text-center">
        {data.label}
      </div>
      {data.description && (
        <div className="text-xs text-gray-600 text-center mb-1">{data.description}</div>
      )}
      
      {/* Output handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ background: '#555' }}
      />
    </div>
  );
};

const nodeWidth = 180;
const nodeHeight = 60;

const layoutNodes = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    const width = node.width || nodeWidth;
    const height = node.height || nodeHeight;
    dagreGraph.setNode(node.id, { width, height });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  dagre.layout(dagreGraph);
  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const width = node.width || nodeWidth;
    const height = node.height || nodeHeight;
    if (!nodeWithPosition) {
      // fallback: stack vertically
      return {
        ...node,
        position: { x: 0, y: 80 * nodes.findIndex(n => n.id === node.id) },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        style: {
          width: `${width}px`,
          height: `${height}px`,
        },
      };
    }
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      style: {
        width: `${width}px`,
        height: `${height}px`,
      },
    };
  });
};

const SyllabusPage = () => {
  const { courseId } = useParams();
  const reactFlowWrapper = useRef(null);
  const { courses } = useCourseStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [error, setError] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [modalResources, setModalResources] = useState([]);
  const nodeTypes = { topic: TopicNode };
  const navigate = useNavigate();

  // Helper: find topic by label (name)
  const findTopicByLabel = useCallback((label, course) => {
    if (!course || !Array.isArray(course.topics)) return null;
    return course.topics.find(t => t.name === label);
  }, []);

  useEffect(() => {
    setError('');
    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      setError('No courses found.');
      setNodes([]);
      setEdges([]);
      setCourseTitle('');
      return;
    }
    // Find course by courseId param or fallback to first
    // Try multiple ways to match course ID
    let course = courses.find(c => 
      c.courseId === courseId || 
      c._id === courseId || 
      c.id === courseId
    ) || courses[0];
    
    console.log('Looking for courseId:', courseId);
    console.log('Available courses:', courses.map(c => ({ id: c._id, courseId: c.courseId, title: c.title })));
    console.log('Selected course:', course);
    if (!course) {
      setError('Course not found.');
      setNodes([]);
      setEdges([]);
      setCourseTitle('');
      return;
    }
    setCourseTitle(course.title);
    // Use syllabus if present, else fallback to topics
    let nodesArr = (course.syllabus && Array.isArray(course.syllabus.nodes) && course.syllabus.nodes.length)
      ? course.syllabus.nodes
      : (Array.isArray(course.topics) ? course.topics.map((topic, idx) => ({
          id: topic.topicId || topic._id || `topic-${idx}`,
          data: { label: topic.name, description: topic.description },
          type: 'topic',
        })) : []);
        
    // Ensure node IDs are strings and not null/undefined
    nodesArr = nodesArr.map((node, idx) => ({ 
      ...node, 
      id: String(node.id || `node-${idx}`)
    })).filter(node => node.id && node.id !== 'null' && node.id !== 'undefined');
    
    console.log('Processed nodes:', nodesArr);
    // Always connect nodes linearly if syllabus.edges is missing or empty
    let edgesArr = [];
    if (course.syllabus && Array.isArray(course.syllabus.edges) && course.syllabus.edges.length) {
      edgesArr = course.syllabus.edges;
    } else if (nodesArr.length > 1) {
      for (let i = 0; i < nodesArr.length - 1; i++) {
        const sourceId = String(nodesArr[i].id);
        const targetId = String(nodesArr[i+1].id);
        
        // Only create edge if both IDs are valid
        if (sourceId && targetId && sourceId !== 'null' && targetId !== 'null') {
          edgesArr.push({
            id: `e_${sourceId}_${targetId}`,
            source: sourceId,
            target: targetId,
            sourceHandle: 'bottom',
            targetHandle: 'top',
            type: 'smoothstep',
            style: { stroke: '#111', strokeWidth: 3 },
            markerEnd: { type: 'arrowclosed', color: '#111' },
            data: { label: '' },
          });
        }
      }
    }
    
    console.log('Created edges:', edgesArr);
    // DEBUG: Log nodes and edges to verify connections
    console.log('NODES:', nodesArr);
    console.log('EDGES:', edgesArr);
    // Only keep edges where source and target IDs exist in nodesArr
    const nodeIds = new Set(nodesArr.map(n => n.id));
    edgesArr = edgesArr.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
    if (!nodesArr.length) {
      setError('No syllabus graph found for this course.');
      setNodes([]);
      setEdges([]);
      return;
    }
    const customNodes = nodesArr.map((node) => ({ ...node, type: 'topic' }));
    // Always use Dagre's computed positions, never random
    const laidOutNodes = layoutNodes(customNodes, edgesArr, 'TB');
    setNodes(laidOutNodes);
    setEdges(edgesArr);
  }, [courses, courseId, setNodes, setEdges]);

  const onConnect = useCallback((params) => {
    // Remove handle fields if they are null to avoid React Flow error
    const { sourceHandle: _sourceHandle, targetHandle: _targetHandle, ...rest } = params;
    setEdges((eds) => addEdge(rest, eds));
  }, [setEdges]);

  const handlePlayVideo = useCallback((videoId) => {
    setSelectedTopic(null); // Close modal if desired
    navigate('/dashboard/learning', { state: { videoId } });
  }, [navigate, courses, courseId, findTopicByLabel]);

  // Redirect to LearningDashboard with the selected topic
  const onNodeClick = useCallback((event, node) => {
    const course = courses.find(c => c.courseId === courseId) || courses[0];
    const topic = findTopicByLabel(node.data.label, course);
    
    if (topic) {
      // Navigate to LearningDashboard with course and topic info
      navigate('/dashboard/learning', { 
        state: { 
          courseId: course.courseId || course._id,
          courseTitle: course.title,
          topicId: topic.id || topic._id,
          topicName: topic.name,
          resources: topic.resources || []
        }
      });
      return;
    }
    
    // Fallback to showing resources in modal if topic not found
    setSelectedTopic(node.data.label);
    let resources = [];
    if (topic && Array.isArray(topic.resources)) {
      resources = topic.resources.map((res) => {
        if (res.type === 'video' && res.url.includes('youtube.com')) {
          // Extract YouTube video ID for thumbnail
          let videoIdMatch = res.url.match(/(?:v=|youtu.be\/|embed\/|shorts\/)([\w-]{11})/);
          let videoId = videoIdMatch ? videoIdMatch[1] : null;
          let thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
          return (
            <div key={res.resourceId} className="flex items-center gap-3 mb-2">
              {thumbnailUrl && (
                <button onClick={() => handlePlayVideo(videoId)} className="block" style={{cursor:'pointer',background:'none',border:'none',padding:0}}>
                  <img src={thumbnailUrl} alt="YouTube Thumbnail" className="w-16 h-10 rounded border shadow" />
                </button>
              )}
              <div className="flex flex-col">
                <button onClick={() => handlePlayVideo(videoId)} className="text-blue-700 font-semibold hover:underline flex items-center gap-1" style={{background:'none',border:'none',padding:0,cursor:'pointer'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="16" height="16"><path d="M21.8 8.001a2.752 2.752 0 0 0-1.936-1.947C18.003 5.5 12 5.5 12 5.5s-6.003 0-7.864.554A2.752 2.752 0 0 0 2.2 8.001 28.936 28.936 0 0 0 1.5 12a28.936 28.936 0 0 0 .7 3.999 2.752 2.752 0 0 0 1.936 1.947C5.997 18.5 12 18.5 12 18.5s6.003 0 7.864-.554A2.752 2.752 0 0 0 21.8 15.999 28.936 28.936 0 0 0 22.5 12a28.936 28.936 0 0 0-.7-3.999zM10 15.5v-7l6 3.5-6 3.5z"/></svg>
                  YouTube Video
                </button>
                <span className="text-xs text-gray-500">YouTube Video</span>
              </div>
            </div>
          );
        } else if (res.type === 'video') {
          return (
            <div key={res.resourceId} className="flex items-center gap-3 mb-2">
              <div className="w-16 h-10 flex items-center justify-center bg-gray-200 rounded border shadow text-gray-500 text-xs">Video</div>
              <div className="flex flex-col">
                <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-semibold hover:underline flex items-center gap-1">
                  Video Link
                </a>
                <span className="text-xs text-gray-500">Video</span>
              </div>
            </div>
          );
        } else if (res.type === 'article') {
          return (
            <div key={res.resourceId} className="flex items-center gap-3 mb-2">
              <div className="w-16 h-10 flex items-center justify-center bg-green-100 rounded border shadow text-green-700 text-xs">Article</div>
              <div className="flex flex-col">
                <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-green-700 font-semibold hover:underline flex items-center gap-1">
                  Article
                </a>
                <span className="text-xs text-gray-500">Article</span>
              </div>
            </div>
          );
        } else {
          return (
            <div key={res.resourceId} className="flex items-center gap-3 mb-2">
              <div className="w-16 h-10 flex items-center justify-center bg-gray-100 rounded border shadow text-gray-700 text-xs">Resource</div>
              <div className="flex flex-col">
                <a href={res.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                  Resource
                </a>
                <span className="text-xs text-gray-500">Resource</span>
              </div>
            </div>
          );
        }
      });
    } else {
      resources = [<span className="text-gray-400">No resources found for {node.data.label}</span>];
    }
    setModalResources(resources);
  }, [courses, courseId, findTopicByLabel, handlePlayVideo]);

  const onPaneClick = useCallback(() => {
    setSelectedTopic(null);
  }, []);

  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div ref={reactFlowWrapper} className="w-full h-screen bg-gradient-to-br from-gray-50 via-stone-50 to-slate-100 p-4 flex flex-col">
      {/* Header Section */}
      <div className="mb-4 flex items-center gap-3 flex-wrap border-b pb-3 border-gray-200">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 pl-4 whitespace-nowrap">
          {courseTitle} Learning Path
        </h2>
        {/* Course Selector */}
        <div className="ml-auto">
          <select
            value={courseId || ''}
            onChange={(e) => {
              const newCourseId = e.target.value;
              if (newCourseId && newCourseId !== courseId) {
                navigate(`/dashboard/syllabus/${newCourseId}`);
              }
            }}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Course</option>
            {courses && courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* React Flow Section */}
      <div className="flex-grow relative rounded-lg overflow-hidden border border-gray-200 shadow-inner bg-white">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { stroke: '#111', strokeWidth: 3 },
            markerEnd: { type: 'arrowclosed', color: '#111' },
            sourceHandle: 'bottom',
            targetHandle: 'top',
          }}
        >
          <MiniMap nodeStrokeWidth={3} nodeColor="#a0a0a0" maskColor="#f0f0f0" />
          <Controls />
          <Background variant="dots" gap={18} size={0.7} color="#d0d0d0" />
        </ReactFlow>
      </div>
      {/* Modal Section */}
      <AnimatePresence>
        {selectedTopic && (
          <motion.div
            key={selectedTopic}
            drag
            dragConstraints={{ left: 0, right: 800, top: 0, bottom: 600 }}
            className="fixed bottom-8 right-8 bg-white border border-gray-300 rounded-xl shadow-lg p-6 z-50 w-80 cursor-move"
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <h2 className="font-bold text-lg mb-2">Resources for {selectedTopic}</h2>
            <div className="space-y-2">
              {modalResources.length > 0 && modalResources.map((resource, index) => (
                <div key={index}>{resource}</div>
              ))}
            </div>
            <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick={() => setSelectedTopic(null)}>
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SyllabusPage;